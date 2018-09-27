'use strict';
// モジュールの呼び出し
const fs = require('fs');
const readline = require('readline');

// ストリームの作成、 readline オブジェクトを作成
const rs = fs.ReadStream('./popu-pref.csv');
const rl = readline.createInterface({ 'input': rs, 'output': {} });

const map = new Map(); // key: 都道府県 value: 集計データのオブジェクト

// line というイベントが発生したときに実行する関数を設定
rl.on('line', (lineString) => {
    // 各列を配列へ格納
    const columns = lineString.split(',');
    const year = parseInt(columns[0]);

    // 特定の年のデータが欲しい
    if (year === 2010 || year === 2015) {
        const prefecture = columns[2];
        const popu = parseInt(columns[7]);

        // 新しい都道府県を登録するときには初期化してから
        let value = map.get(prefecture);
        if (!value) {
            value = {
                popu10: 0,
                popu15: 0,
                change: null
            };
        }

        // 各年 男女別の人口データになっているので足し合わせる
        if (year === 2010) {
            value.popu10 += popu;
        }
        if (year === 2015) {
            value.popu15 += popu;
        }

        // 都道府県名をキーに統計情報オブジェクトを挿入ないし更新
        map.set(prefecture, value);
    }
});

// ストリームに情報を流し始める
rl.resume();

// ストリームが最後まで行ったらマップを全表示
rl.on('close', () => {
    // pair は配列で、 pair[0]に都道府県名
    //                 pair[1]に統計情報オブジェクトが入っている
    for (let pair of map) {
        const value = pair[1];
        value.change = value.popu15 / value.popu10;
    }

    // 人口増加率の降順に並び替え
    const rankingArray = Array.from(map).sort((pair1, pair2) => {
        return pair2[1].change - pair1[1].change;
    });

    // 出力を整形
    const rankingStrings = rankingArray.map((pair) => {
        return pair[0] + ': ' + pair[1].popu10 + '=>' + pair[1].popu15 + ' 変化率:' + pair[1].change;
    });
    console.log(rankingStrings);
});