/**
 * 方針
 * - ログデータはすべてcookieの"log"に投げてなんとかします
 *     - cookieのログには、base64(UTF-8)エンコードしたJSON文字列を保存します。
 *     - JSONが示すオブジェクトは`[unixTime(Number), status(Boolean)]`をまとめた二次元配列です。
 * - ページロード時、該当cookieが存在しない場合は"1970年1月3日00:00(UTC)にOFF"を加えます(init)
 * - Startボタン押下時、直近のログがOFFなら"現在時刻にON"を加えます(start)
 * - Stopボタン押下時、直近のログがONなら"現在時刻にOFF"を加えます(stop)
 * - Resetボタン押下時、一度すべてのログを削除してから"1970年1月3日00:00(UTC)にOFF"を加えます(reset)
 * - ページロード時、0.5秒間隔で"ログとinputを監査して#counterの表示を更新する関数(update)"を実行します。
 */

/**
 * base64toObj(base) - base64→オブジェクトに変換します。マルチバイト非対応。
 * @param {String} base 
 * @returns {*} - 変換後のオブジェクト。ObjectとかArrayとか？
 */
const base64toObj = (base) => JSON.parse(atob(base));

/**
 * objToBase64(obj) - オブジェクト→base64に変換します。マルチバイト非対応。
 * @param {*} obj - 変換するオブジェクト
 * @returns {String} - base64エンコードしたオブジェクトのJSON文字列
 */
const objToBase64 = (obj) => btoa(JSON.stringify(obj));

/**
 * getCookieByKey(key) - cookieの特定の値だけ引っ張ってきます
 * @param {*} key - 取得したいkey
 * @returns - 指定したkeyのvalue。存在しないkeyを参照した場合はundefinedを返します
 */
const getCookieByKey = (key) => (document.cookie.match(new RegExp(key + '\=([^\;]*)\;*')) ?? [0, undefined])[1];

/**
 * init() - ページロード時実行。cookieにlogが存在しなければ"1970年1月1日00:00(UTC)にOFF"を加えます。
 * また、range設定を過去のrange設定から引っ張り出してきます。
 */
const init = () => {
    if (getCookieByKey("log") == undefined) {
        const newObj = [[0, false]];
        document.cookie = "log=" + objToBase64(newObj) + "; max-age=360000";
    }
    if (getCookieByKey("range") != undefined) {
        const rangeSet = base64toObj(getCookieByKey("range"));
        document.querySelector("#input-hour").value = rangeSet[0];
        document.querySelector("#input-min").value = rangeSet[1];
        document.querySelector("#input-sec").value = rangeSet[2];
    }
};

/**
 * start() - Startボタン押下時実行。直近のログがOFFなら"現在時刻にON"を加えます。また、Range設定をrangeに保存します。
 */
const start = () => {
    const log = base64toObj(getCookieByKey("log"));
    if (!log.at(-1)[1]) {
        log.push([Date.now(), true]);
    }
    document.cookie = "log=" + objToBase64(log) + "; max-age=360000";
    const rangeSet = [
        document.querySelector("#input-hour").value,
        document.querySelector("#input-min").value,
        document.querySelector("#input-sec").value
    ];
    document.cookie = "range=" + objToBase64(rangeSet) + "; max-age=360000";
};

/**
 * stop() - Stopボタン押下時実行。直近のログがONなら"現在時刻にOFF"を加えます
 */
const stop = () => {
    const log = base64toObj(getCookieByKey("log"));
    if (log.at(-1)[1]) {
        log.push([Date.now(), false]);
    }
    document.cookie = "log=" + objToBase64(log) + "; max-age=360000;";
};

/**
 * reset() - Resetボタン押下時実行。一度すべてのログを削除してから"1970年1月3日00:00(UTC)にOFF"を加えます
 */
const reset = () => {
    const newObj = [[0, false]];
    document.cookie = "log=" + objToBase64(newObj) + "; max-age=360000";
}

/**
 * update() - ページロード時0.5秒間隔で実行。ログとinputを監査して#counterの表示を更新する関数
 */
const update = () => {
    var logArray = base64toObj(getCookieByKey("log"));
    var nowUnix = Date.now();
    var recordRange = 0;
    recordRange += document.querySelector("#input-hour").value * 1000 * 60 * 60;
    recordRange += document.querySelector("#input-min").value * 1000 * 60;
    recordRange += document.querySelector("#input-sec").value * 1000;
    var recordLimit = nowUnix - recordRange;
    /* 記録制限のタイミング以降のログを制作 */
    var recordLog = logArray.filter(e => e[0] >= recordLimit);
    var countTime = 0;
    recordLog.forEach(function (value) {
        value[1] ? countTime -= value[0] : countTime += value[0];
    });
    /* 最後がONなら今を足す */
    if (logArray.at(-1)[1]) {
        countTime += nowUnix;
    }
    /* 制限時点でONなら制限開始時刻を引く */
    var ignored = logArray.length - recordLog.length;
    if (ignored >= 0 && logArray[ignored - 1][1]) {
        countTime -= recordLimit;
    }
    document.querySelector("#counter").innerHTML = String(new Date(countTime).toISOString().slice(11, 23));
}

/**
 * ページロード時に実行するやつ
 */
window.addEventListener("load", function () {
    init();
    setInterval(update, 1 / 60);
});

/**
 * キー押下時(正確にはキー押下をやめたとき)、特定のボタンの代わりをします
 * S:Start, P:Stop, R:Reset
 */
document.addEventListener('keyup', keyupEvent, false);
function keyupEvent(event) {
    if (event.key === "s" || event.key === "S") {
        start();
    }
    if (event.key === "p" || event.key === "P") {
        stop();
    }
    if (event.key === "r" || event.key === "R") {
        reset();
    }
}