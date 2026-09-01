/* pixelChar.js — pixel art character renderer
   Default: wavy long hair (warm brown), pink sweater outfit, fair skin
   Used on index.html splash screen
*/

function drawPixelChar(canvas, skinIdx, hairColIdx, hairStyleKey, outfitKey) {
  const S = 2;
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const SKINS = [
    {s:'#fde8d8',sh:'#f0c8a8',lips:'#d49090'},
    {s:'#f5d0b0',sh:'#ddb080',lips:'#c08080'},
    {s:'#e8b888',sh:'#c89060',lips:'#b87060'},
    {s:'#c89060',sh:'#a87040',lips:'#a06050'},
    {s:'#a87048',sh:'#886030',lips:'#905040'},
    {s:'#7a4828',sh:'#5a3018',lips:'#7a4038'},
  ];
  const HAIR_COLS = [
    {c:'#3d2010',h:'#5a3020'},
    {c:'#7a5038',h:'#9a6848'},
    {c:'#8a3820',h:'#b05030'},
    {c:'#c8a050',h:'#e0c070'},
    {c:'#1a1010',h:'#302020'},
    {c:'#c09098',h:'#d8b0b8'},
  ];
  const OUTFIT_COLORS = {
    sweater: {main:'#E1CCCC',acc:'#d4b8b8',bot:'#c4a0a8',botacc:'#ddd0d0'},
    dress:   {main:'#dbc8d4',acc:'#c8b0c0',bot:'#dbc8d4',botacc:'#ede0e8'},
    knit:    {main:'#c8bfb8',acc:'#b0a898',bot:'#b0a090',botacc:'#d0c8c0'},
    check:   {main:'#d4c8b8',acc:'#a08860',bot:'#8a7060',botacc:'#c0b098'},
    hoodie:  {main:'#c4c8d4',acc:'#adb0c0',bot:'#9498a8',botacc:'#d4d8e4'},
  };

  function px(x,y,w,h,col){ctx.fillStyle=col;ctx.fillRect(x*S,y*S,w*S,h*S);}
  function row(x,y,w,col){px(x,y,w,1,col);}
  function col_(x,y,h,c){px(x,y,1,h,c);}

  const sk   = SKINS[skinIdx]       || SKINS[1];
  const hc   = HAIR_COLS[hairColIdx] || HAIR_COLS[1];
  const o    = OUTFIT_COLORS[outfitKey] || OUTFIT_COLORS.sweater;
  const skin = sk.s, skinsh = sk.sh, lips = sk.lips;
  const hair = hc.c, hairh  = hc.h;

  /* HEART */
  const hp='#e8a0b0';
  row(18,1,4,hp);row(26,1,4,hp);row(16,3,16,hp);row(14,5,20,hp);
  row(16,8,16,hp);row(18,10,12,hp);row(20,12,8,hp);row(22,14,4,hp);

  /* HAIR BACK */
  if(hairStyleKey==='longstraight'||hairStyleKey==='wavylong'){
    row(10,18,28,hair);
    col_(10,22,28,hair);col_(37,22,28,hair);
    if(hairStyleKey==='wavylong'){col_(9,30,18,hair);col_(38,30,18,hair);}
  }

  /* FACE */
  for(let y=18;y<38;y++) row(13,y,22,skin);
  col_(13,22,10,skinsh);col_(34,22,10,skinsh);

  /* HAIR TOP */
  if(hairStyleKey==='longstraight'){
    for(let y=14;y<20;y++) row(11,y,26,hair);
    row(10,18,28,hair);row(10,19,4,hair);row(34,19,4,hair);
    ctx.globalAlpha=0.45;row(16,14,8,hairh);ctx.globalAlpha=1;
  } else if(hairStyleKey==='wavylong'){
    row(12,13,24,hair);row(11,14,26,hair);
    for(let y=15;y<18;y++) row(10,y,28,hair);
    px(10,12,3,3,hair);px(17,11,4,4,hair);
    px(25,11,4,4,hair);px(32,12,4,3,hair);
    ctx.globalAlpha=0.4;row(14,12,10,hairh);ctx.globalAlpha=1;
  } else if(hairStyleKey==='bob'){
    row(12,15,24,hair);row(11,16,26,hair);row(10,17,28,hair);
    row(10,18,4,hair);row(34,18,4,hair);
    ctx.globalAlpha=0.4;row(15,15,8,hairh);ctx.globalAlpha=1;
  } else if(hairStyleKey==='curly'){
    px(11,12,8,8,hair);px(20,10,8,10,hair);px(29,12,8,8,hair);
    row(10,18,28,hair);
    ctx.globalAlpha=0.4;px(12,13,4,3,hairh);px(21,11,4,3,hairh);px(30,13,4,3,hairh);ctx.globalAlpha=1;
  } else if(hairStyleKey==='short'){
    row(13,15,22,hair);row(12,16,24,hair);row(11,17,26,hair);
    row(11,18,4,hair);row(33,18,4,hair);row(11,19,4,hair);row(33,19,4,hair);
    ctx.globalAlpha=0.4;row(15,15,8,hairh);ctx.globalAlpha=1;
  }

  /* EYES */
  px(16,24,4,4,'#2e1e1a');px(28,24,4,4,'#2e1e1a');
  px(17,24,2,2,'#5a3a2a');px(29,24,2,2,'#5a3a2a');
  px(18,24,1,1,'#fff');px(30,24,1,1,'#fff');
  row(15,23,2,'#2e1e1a');row(19,23,2,'#2e1e1a');
  row(27,23,2,'#2e1e1a');row(31,23,2,'#2e1e1a');

  /* BLUSH */
  ctx.globalAlpha=0.55;row(13,29,4,'#f0a8b0');row(31,29,4,'#f0a8b0');ctx.globalAlpha=1;

  /* MOUTH */
  row(21,33,6,lips);px(20,32,1,1,lips);px(27,32,1,1,lips);

  /* NECK */
  px(20,38,8,4,skin);

  /* OUTFIT BODY */
  px(11,42,26,16,o.main);px(9,44,4,10,o.main);px(35,44,4,10,o.main);
  row(18,42,12,o.acc);row(18,43,12,o.acc);
  if(outfitKey==='check'){ctx.globalAlpha=0.4;for(let x=11;x<37;x+=4)col_(x,42,16,o.acc);for(let y=44;y<58;y+=4)row(11,y,26,o.acc);ctx.globalAlpha=1;}
  if(outfitKey==='hoodie'){px(18,52,12,5,'#b8bcd0');row(18,52,12,'#a8acbc');}
  if(outfitKey==='knit'){ctx.globalAlpha=0.3;for(let y=44;y<58;y+=3)row(11,y,26,o.acc);ctx.globalAlpha=1;}
  if(outfitKey==='dress'){row(16,42,16,'#f0e8ec');ctx.globalAlpha=0.6;row(15,43,18,'#e8d8e4');ctx.globalAlpha=1;}

  /* SKIRT */
  px(11,58,26,10,o.bot);row(11,66,26,o.botacc);row(11,67,26,o.botacc);

  /* LEGS */
  px(14,68,8,4,skin);px(26,68,8,4,skin);
  px(13,70,9,3,'#f5eded');px(26,70,9,3,'#f5eded');
  px(12,71,10,3,o.bot);px(26,71,10,3,o.bot);

  /* HAIR FRONT */
  if(hairStyleKey==='longstraight'){
    col_(10,22,30,hair);col_(37,22,30,hair);
    col_(11,38,16,hair);col_(36,38,16,hair);
  } else if(hairStyleKey==='wavylong'){
    col_(9,24,24,hair);col_(38,24,24,hair);
    col_(10,34,14,hair);col_(37,34,14,hair);
    px(8,34,3,6,hair);px(8,44,3,6,hair);
    px(38,34,3,6,hair);px(38,44,3,6,hair);
  } else if(hairStyleKey==='bob'){
    col_(10,20,22,hair);col_(37,20,22,hair);
    row(11,40,5,hair);row(32,40,5,hair);
  } else if(hairStyleKey==='curly'){
    px(9,22,5,10,hair);px(34,22,5,10,hair);
    px(8,26,4,8,hair);px(36,26,4,8,hair);
  } else if(hairStyleKey==='short'){
    col_(11,20,8,hair);col_(36,20,8,hair);
  }

  /* SPARKLE */
  row(39,20,1,5,'#E1CCCC');row(37,22,5,1,'#E1CCCC');
  px(38,21,1,1,'#E1CCCC');px(40,21,1,1,'#E1CCCC');
}
