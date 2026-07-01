const config = {
    type: Phaser.AUTO,
    width: 1280,
    height: 720,
    backgroundColor: "#d8edf8",

    scene: {
    preload,
    create,
    update
}
};

let scene;
let product;
let film;
let conveyor;
let tunnel;
let isHolding = false;
let checkZone;
let inPerfectZone = false;
let inGoodZone = false;
let resultImage;
let score = 0;
let scoreText;
let filmApplied = false;
let wrapZone;
let inWrapZone = false;
let roll;
let filmSheet;
let filmDropping = false;

new Phaser.Game(config);

function preload(){

    this.load.image("bottle","images/bottle.png");
    this.load.image("film","images/film.png");
    this.load.image("filmOk","images/film_ok.png");
    this.load.image("filmNg","images/film_ng.png");
    this.load.image("filmGood","images/film_good.png");
    this.load.image("tunnel","images/tunnel.png");
    this.load.image("perfect", "images/perfect.png");
    this.load.image("good", "images/good.png");
    this.load.image("miss", "images/miss.png");
    this.load.image("roll", "images/roll.png");
    this.load.image("filmSheet","images/film_sheet.png");

}

function create() {
scene = this;

    // タイトル
    this.add.text(40,30,"🏭 TORNADOでシュリンクしよう！",{
        fontSize:"32px",
        color:"#333"
    });

    // 包装機
  tunnel = this.add.image(
    640,
    350,
    "tunnel"
);

tunnel.setScale(1);
tunnel.setDepth(10);

    // 判定エリア（デバッグ用）
checkZone = this.add.rectangle(
    840,   // X座標（あとで調整）
    465,   // Y座標
    30,    // 幅
    135,   // 高さ
    0xff0000,
    0.3    // 半透明
);

checkZone.setVisible(false);

    // 製品
    product = this.add.image(120, 470, "bottle");

product.setScale(0.75);

film = this.add.image(
    product.x,
    product.y,
    "film"
);

film.setScale(0.4);

film.visible = false;

this.input.on("pointerdown",()=>{

    if (!inWrapZone) return;
    if (filmApplied) return;

    isHolding = true;

    film.visible = true;
    film.setTexture("film");

    // ボトルの少し上からスタート
    film.x = product.x;
    film.y = product.y - 120;

    filmDropping = true;

scene.tweens.add({
    targets: film,
    y: product.y + 10,
    duration: 180,
    ease: "Quad.Out",
    onComplete: () => {
        filmDropping = false;
    }
});

});   // ← pointerdownはここで終わり

this.input.on("pointerup",()=>{

    if (!isHolding) return;

    isHolding = false;
    filmApplied = true;

    if (inPerfectZone){

    film.setTexture("filmOk");
    showResult("perfect");

}
else if(inGoodZone){

    film.setTexture("filmGood");
    showResult("good");

}
else{

    film.setTexture("filmNg");
    showResult("miss");

}

});

resultImage = this.add.image(
    1110,
    300,
    "perfect"
);
    resultImage.setVisible(false);
    resultImage.setScale(0.5);
    resultImage.setDepth(100);

scoreText = this.add.text(1050,30,"Score : 0",{
    fontSize:"28px",
    color:"#333"
});

filmSheet = this.add.image(
    210,
    440,
    "filmSheet"
);

filmSheet.setScale(0.5, 1);
filmSheet.setAlpha(0.5);
filmSheet.setDepth(1);

roll = this.add.image(
    210,
    335,
    "roll"
);

roll.setScale(0.5);
roll.setDepth(2);

}

function update(){

    product.x += 2;

if(product.x > 1330){

    product.x = -50;

    film.visible = false;
    film.setTexture("film");
    film.setScale(0.4);

    filmApplied = false;   // 次のボトルはまた包装できる
}

film.x = product.x;

if (!filmDropping) {
    film.y = product.y + 10;
}

const targetScale = isHolding ? 0.9 : 0.65;

film.setScale(
    Phaser.Math.Linear(film.scale, targetScale, 0.2)
);

const distance = Math.abs(product.x - checkZone.x);

// PERFECT
if (distance <= 15) {

    inPerfectZone = true;
    inGoodZone = false;

}
// GOOD
else if (distance <= 40) {

    inPerfectZone = false;
    inGoodZone = true;

}
// MISS
else {

    inPerfectZone = false;
    inGoodZone = false;

}

if (inPerfectZone){

    checkZone.fillColor = 0x00ff00;

}
else if(inGoodZone){

    checkZone.fillColor = 0xffff00;

}
else{

    checkZone.fillColor = 0xff0000;

}

if (
    product.x > filmSheet.x - filmSheet.displayWidth / 2 &&
    product.x < filmSheet.x + filmSheet.displayWidth / 2
) {
    inWrapZone = true;
} else {
    inWrapZone = false;
}

}

function showResult(imageKey){

    resultImage.setTexture(imageKey);
resultImage.setVisible(true);
resultImage.setScale(0.3);

scene.tweens.add({
    targets: resultImage,
    scale: 0.6,
    duration: 150,
    ease: "Back.Out"
});

    // フィルムを揺らす
    scene.tweens.add({
        targets: filmSheet,
        angle: 3,
        duration: 60,
        yoyo: true
    });

    scene.time.delayedCall(1500, ()=>{

        resultImage.setVisible(false);

    });

    if(imageKey === "perfect"){

    score += 10;

}
else if(imageKey === "good"){

    score += 5;

}

else if(imageKey === "miss"){

    score += 0;

}

scoreText.setText("Score : " + score);

}