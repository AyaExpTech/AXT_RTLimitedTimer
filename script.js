/**
 * ページロード時、history配列を定義
 * ON-OFF履歴の保存に使います
 */

const history = [];

/**
 * Startボタンが押されたとき、履歴にUNIXタイムをぶん投げる
 */
const start = () => {
    history.at(-1) ? "" : history.push([Date.now(), true]);
    history.length == 0 ? history.push([Date.now(), true]) : "";
};

/**
 * Stopボタンが押されたとき、履歴にUNIXタイムをぶん投げる
 */
const stop = () => {
    history.at(-1) ? history.push([Date.now(), false]) : "";
};

/**
 * 一定間隔で実行する関数
 * - 現在の時間-記録制限時間をしてhistoryからそれより前の記録を除外
 * - history[0]がfalse記録なら現在の時間-記録制限時間にtrue記録を捏造
 * - falseなやつ全部足してtrueなやつ全部引く
 * - 整形して#counterに投げ込む
 */
const interval = () => {
    const docV = (e) => document.querySelector(e).value;
    const heldMs = docV("#input-hour") * 3600000 + docV("#input-min") * 60000 + docV("#input-sec") * 1000;
    const heldUNIX = Date.now() - heldMs;
    console.log(heldMs);
    console.log(heldUNIX);
    console.log(history);
    const validHistory = [];
    history.forEach(e => (e[0] > heldUNIX) ? validHistory.push(e) : "");
    history.length ? (validHistory[0][1] ? "" : validHistory.unshift([heldUNIX, true])) : "";
    console.log(validHistory);
    let time = 0;
    validHistory.forEach(e => e[1] ? (time -= e[0]) : (time += e[0]));
    console.log(time);
    const timer = [
        ("000" + Math.floor(time / 3600000).toString()).slice(-2), //hour
        ("000" + Math.floor(time / 60000 % 60).toString()).slice(-2), //min
        ("000" + Math.floor(time / 1000 % 60).toString()).slice(-2), //sec
        ("000" + Math.floor(time / 10 % 100).toString()).slice(-2) //ms
    ];
    console.log(timer);
    document.querySelector("#counter").innerHTML = `${timer[0]}:${timer[1]}:${timer[2]}.${timer[3]}`;
}

setInterval(interval, 1000)