import { isUndefined } from 'lodash';

const JUNK_KEY = '__KEY_SELECTOR__JUNK_KEY';

/**
 * Lớp KeySelector thực thi giải thuật lấy ra key hợp lệ trong một bể API key có sẵn
 *
 * Bài toán:
 * >> Có một bể n API key, trong đó k key có khả năng bị 3rd chặn rate limit;
 * >> Yêu cầu một hàm ưu tiên lấy ra một key thỏa mãn trong (n - k) key còn lại,
 * >> và cũng phải đảm bảo các key được ưu tiên được gọi số lần như nhau (phân phối đều).
 * >> Tuy nhiên, sau x lần gọi API sẽ thực hiện thử dùng lại key trong k key để
 * >> kiểm tra xem đã pass rate limit hay chưa
 *
 * Ví dụ:
 * - Input:
 * >> Một bể API gồm [1, 2, 3, 4, 5]
 * >> Các key bị rate limit [1, 2]
 *
 * - Output:
 * >> Sau khi thực hiện thao tác lấy API và kiểm tra 1000 lần,
 * >> bảng phân phối key có dạng như sau:
 * | key | số lần gọi |
 * |  1  |     10     |
 * |  2  |     10     |
 * |  3  |     327    |
 * |  4  |     327    |
 * |  5  |     326    |
 * >> Note: Số lần có thể thay đổi tùy thuộc vào config sau x lần gọi API;
 *
 * Ý tưởng:
 * >> Duy trì 2 mảng (queue), trong đó 1 queue A chứa các key có thể sử dụng, 1 queue B chứa các key cần phải chờ.
 * >> Đối với queue A, sau khi dùng xong key ở đầu queue, lấy ra và đưa xuống cuối queue (đảm bảo phân phối đều).
 * >> Đối với queue B, queue được khởi tạo sẵn với x key rác để đảm bảo key đưa vào cuối sẽ cần đợi x lần gọi API mới có thể dùng.
 * >> Sau mỗi lần gọi API thì lấy ra key đầu, nếu phát hiện key lỗi thì đẩy vào cuối queue để chờ thêm một vòng x lần,
 * >> còn không thì đẩy vào đầu queue A để lần gọi kế tiếp sử dụng luôn (vì đã chờ đủ thời gian).
 *
 * >> Như vậy, nếu key dùng tốt thì sẽ được quay vòng lần lượt trong queue A; nếu key bị lỗi thì sau mỗi lần được gọi sẽ phải
 * >> chờ x lần gọi API ở queue B.
 */
export class KeySelector {
    declare availableKeys: string[];
    declare pendingKeyLength: number;
    declare pendingKeys: string[];
    declare logger: CallableFunction;

    /**
     *
     * @param {string[]} _availableKeys                  mảng API key khởi tạo
     * @param {number} pendingKeyLength                  x lần chờ để quay vòng sử dụng key
     * @param {{ logging: CallableFunction }} options    các tham số tùy chỉnh
     */
    constructor(
        _availableKeys: string[] = [],
        pendingKeyLength: number = 10,
        options: { logging: CallableFunction } = { logging: console.log },
    ) {
        this.availableKeys = _availableKeys; // queue A
        this.pendingKeyLength = pendingKeyLength;
        this.pendingKeys = Array.from(Array(pendingKeyLength).keys()).map((_) => JUNK_KEY); // khởi tạo key rác cho queue B
        this.logger = options.logging;
    }

    /**
     * Hàm lấy ra key thỏa mãn,
     * @returns key
     *
     * Bước 1:
     * >> Lấy ra key đầu tiên ở queue A
     * >> Lưu ý: Không bỏ hẳn khỏi queue để hỗ trợ việc gọi API đồng thời,
     * >> nếu bỏ hẳn mà queue A chỉ có 1 key dùng được thì chỉ có một lần gọi API được, các lần khác đọc được key rỗng.
     * >> Nếu key lấy ra là undefined chứng tỏ queue A rỗng, thông báo để thêm key.
     *
     * Bước 2:
     * >> Lấy ra key đầu tiên ở queue B, kiểm tra:
     * >> Nếu không là key rác thì thêm ngược vào queue B.
     * >> Nếu không phải key rác thì thêm vào vị trí index = 1 của queue A (do lần lấy ở trên không bỏ hẳn key khỏi queue)
     * >> Việc bỏ key khỏi queue A sẽ thực hiện sau khi hoàn thành sử dụng key (hàm push).
     *
     */
    get(): string {
        const key = this.availableKeys[0]; // B1
        if (isUndefined(key)) {
            this.logger(`[KeySelector][get] No key available left!`);
            return key;
        }

        const pendingKey = this.pendingKeys.shift(); // B2
        if (pendingKey === JUNK_KEY) {
            this.pendingKeys.push(JUNK_KEY); // thêm ngược lại đối với key rác
        } else {
            this.availableKeys.splice(1, 0, pendingKey); // thêm vào vị trí index = 1 của queue A
        }
        return key;
    }

    /**
     * Hàm thêm ngược key vào queue,
     * @param {string} [key]
     * @param {boolean} [shouldPending=false]
     *
     * Bước 1:
     * >> Đọc lại key đầu tiên của queue A.
     * >> Nếu key chuẩn bị thêm trùng với key đầu tiên của queue, thực hiện bỏ key đầu tiên khỏi queue (đây là case bình thường).
     * >> Nếu key chuẩn bị thêm không trùng với key đầu tiên của queue thì bỏ qua. Trường hợp này do
     * >> việc gọi API đồng thời, ví dụ gọi đồng thời 2 API, API 1 đã bỏ key khỏi queue rồi, API 2 không cần làm nữa.
     *
     * Bước 2:
     * >> Thêm key vào cuối queue A hoặc B tùy thuộc vào tham số shouldPending.
     *
     */
    push(key: string, shouldPending: boolean = false) {
        if (isUndefined(key)) return;

        const _key = this.availableKeys[0]; // B1
        if (_key === key) {
            this.availableKeys.shift(); // Bỏ key đầu tiên khỏi queue
        }

        if (shouldPending) {
            this.pendingKeys.push(key); // thêm vào queue B nếu key lỗi
        } else {
            this.availableKeys.push(key); // thêm vào queue A nếu key dùng được
        }
    }

    /**
     * Hàm reset lại bể key
     * @param {string[]} _availableKeys
     * @param {number} pendingKeyLength
     */
    reset(_availableKeys: string[] = [], pendingKeyLength?: number) {
        this.availableKeys = _availableKeys; // queue A
        this.pendingKeyLength = pendingKeyLength ?? this.pendingKeyLength;
        this.pendingKeys = Array.from(Array(this.pendingKeyLength).keys()).map((_) => JUNK_KEY); // khởi tạo key rác cho queue B
    }
}
