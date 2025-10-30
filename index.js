let soflanMusicListJson;
let isReadSoflanMusicList = false;

let isShowAllMode = false;
let keyInputArr = Array(10);
document.addEventListener('keydown',checkKonamiCommand);

function checkKonamiCommand(e){
  if(!isReadSoflanMusicList){
    return;
  }
  keyInputArr.push(e.key);
  keyInputArr.shift();
  if(keyInputArr.toString().toLowerCase() =='arrowup,arrowup,arrowdown,arrowdown,arrowleft,arrowright,arrowleft,arrowright,b,a'
  || keyInputArr.toString().toLowerCase() =='u,u,d,d,l,r,l,r,b,a'){
    isShowAllMode = true;
    document.getElementById('MUSIC_SELECT').value = '';

    let musicTitleList = document.querySelectorAll('div[data-div-music-title]');
    for(musicTitleListIdx = 0;musicTitleListIdx < musicTitleList.length;musicTitleListIdx++){
      musicTitleList[musicTitleListIdx].style.display = '';
    }

    let musicList = document.querySelectorAll('div[data-div-music]');
    for (let musicListIdx = 0;musicListIdx < musicList.length;musicListIdx++){
      musicList[musicListIdx].style.display = '';
    }
    
    let memoTextareaList = document.querySelectorAll('textarea');
    for(let memoTextareaListIdx = 0;memoTextareaListIdx < memoTextareaList.length;memoTextareaListIdx++){
      fixMemoHeight(memoTextareaList[memoTextareaListIdx]);
    }    

    calcSpeedAll();
  }
}

function createInputListJson(){
  let inputObj = {}; //JSON変換用の入力オブジェクト
  inputObj.defaultGreen = document.getElementById('input-default-green').value;
  inputObj.defaultSud = document.getElementById('input-default-sud').value;
  inputObj.defaultLift = document.getElementById('input-default-lift').value;
  inputObj.musicList = [];
  let musicTblList = document.querySelectorAll('table[data-table-music]'); //現在のテーブルリストを取得
  for(let musicTblListIdx = 0;musicTblListIdx < musicTblList.length;musicTblListIdx++){
    let musicObj = {};
    musicObj.id = musicTblList[musicTblListIdx].dataset.musicId;
    musicObj.bpmList = [];
    inputObj.musicList.push(musicObj);
    let musicTableTrs = musicTblList[musicTblListIdx].tBodies[0].querySelectorAll('tr');
    let musicTableTrsIdx = 0;
    while(musicTableTrsIdx < musicTableTrs.length){
      let bpmObj = {};      
      musicObj.bpmList.push(bpmObj);
      musicTableTrsIdx++;
      while(musicTableTrsIdx < musicTableTrs.length && musicTableTrs[musicTableTrsIdx].dataset.trType == 'action'){
        if(bpmObj.actionList === undefined){
          bpmObj.actionList = [];
        }
        let actionObj = {};
        actionObj.actionType = musicTableTrs[musicTableTrsIdx].querySelector('td[data-td-action] select[data-select-action]').value;
        actionObj.actionValue = musicTableTrs[musicTableTrsIdx].querySelector('td[data-td-input-value] [data-element-input-value]').value;
        actionObj.memo = musicTableTrs[musicTableTrsIdx].querySelector('td[data-td-memo] textarea[data-textarea-memo]').value;
        bpmObj.actionList.push(actionObj);
        musicTableTrsIdx++;
      }
    }
  }
  return JSON.stringify(inputObj);
}

function readJson(){
  let inputListJson;
  try{
    inputListJson = JSON.parse(document.getElementById('textarea-input-json').value);
  }catch(readJsonError){
    console.log(readJsonError);
    alert('テキストの読込に失敗しました。');
    return;
  }
  deleteAllActionTr();
  readInputList(inputListJson);
  alert('テキストの読込が完了しました。');
}


function clearJson(){
  localStorage.removeItem('soflan-input-list');
}

function openPopover(){
  document.getElementById('textarea-input-json').style.display = 'none';
  document.getElementById('button-input-json-clipboard').style.display = 'none';
  document.getElementById('button-read-json').style.display = 'none';

  document.getElementById('button-show-input-json-mode').style.display = '';
  document.getElementById('button-show-read-json-mode').style.display = '';
  document.getElementById('button-close-popover').style.display = '';


  document.getElementById('POPOVER_DIV').showPopover();
}

function closePopover(){
  document.getElementById('POPOVER_DIV').hidePopover();
}

function showInputJsonMode(){
  document.getElementById('button-show-input-json-mode').style.display = 'none';
  document.getElementById('button-show-read-json-mode').style.display = 'none';
  document.getElementById('textarea-input-json').style.display = '';
  document.getElementById('button-input-json-clipboard').style.display = '';
  document.getElementById('button-close-popover').style.display = '';
  document.getElementById('textarea-input-json').value = createInputListJson();
}

function showReadJsonMode(){
  document.getElementById('button-show-input-json-mode').style.display = 'none';
  document.getElementById('button-show-read-json-mode').style.display = 'none';
  document.getElementById('textarea-input-json').style.display = '';
  document.getElementById('button-read-json').style.display = '';
  document.getElementById('button-close-popover').style.display = '';

  document.getElementById('textarea-input-json').value = '';
}

function inputJsonToClipboard(){
  if(!navigator.clipboard){
    alert('データをクリップボードにコピーできませんでした。');
    return;
  }
  navigator.clipboard.writeText(document.getElementById('textarea-input-json').value).then(
    () =>{
      alert('データをクリップボードにコピーしました。');
    },
    () => {
      alert('データをクリップボードにコピーできませんでした。');
    });

}

function musicSelect(){
  let selectMusic = document.getElementById('MUSIC_SELECT').value;
  if(isShowAllMode){
    let headerDiv = document.querySelector('div.div-header');
    let selectMusicDiv = document.querySelector('div[data-music-id="' + selectMusic +'"]');
    window.scrollTo({top:selectMusicDiv.offsetTop - headerDiv.offsetHeight});
  }else{
    let musicDivList = document.querySelectorAll('div[data-div-music]'); //現在のテーブルリストを取得
    for(let musicDivListIdx = 0;musicDivListIdx < musicDivList.length;musicDivListIdx++){
      if(musicDivList[musicDivListIdx].dataset.musicId == selectMusic){
        musicDivList[musicDivListIdx].style.display = '';
        calcSpeed(selectMusic + '_TBL');
        memoTextareaList = musicDivList[musicDivListIdx].querySelectorAll('textarea');
        for(let memoTextareaListIdx = 0;memoTextareaListIdx < memoTextareaList.length;memoTextareaListIdx++){
          fixMemoHeight(memoTextareaList[memoTextareaListIdx]);
        }
      }else{
        musicDivList[musicDivListIdx].style.display = 'none';
      }
    }
  }
}

function createSelectSortByName(){
  sortByName();
  createMusicOptionList('name');
}

function createSelectSortByVersionAsc(){
  sortByVersionAsc();
  createMusicOptionList('version');
}

function createSelectSortByVersionDesc(){
  sortByVersionDesc();
  createMusicOptionList('version');
}


function createSelectSortBySoflan(){
  sortBySoflan();
  createMusicOptionList('soflan');
}

function createMusicOptionList(sortType){
  if(!isReadSoflanMusicList){
    return;
  }
  let musicListSelect = document.getElementById('MUSIC_SELECT');
  let selectedOption = document.getElementById('MUSIC_SELECT').value;
  //既存optionリストを削除
  musicListSelect.options.length = 0;

  //リストの頭に空行を追加
  let blankOp = document.createElement('option');
  blankOp.text = '---';
  blankOp.value = '';
  musicListSelect.appendChild(blankOp);

  //現在のmusicListの並び順でoptionを付加
  for(let lookMusic in soflanMusicListJson.musicList){
    let addOp = document.createElement('option');

    soflanMusicListJson.musicList[lookMusic].soflan
    if(sortType == 'name'){
    addOp.text = soflanMusicListJson.musicList[lookMusic].title;
    }else if(sortType == 'version'){
    addOp.text = (soflanMusicListJson.musicList[lookMusic].verName + '\u00A0\u00A0').substring(0,5)
                + soflanMusicListJson.musicList[lookMusic].title;
    }else if(sortType == 'soflan'){
    addOp.text = soflanMusicListJson.musicList[lookMusic].soflan.toFixed(2)
                + '\u00A0' + soflanMusicListJson.musicList[lookMusic].title;
    }
    addOp.value = soflanMusicListJson.musicList[lookMusic].id;
    musicListSelect.appendChild(addOp);
    if(selectedOption == soflanMusicListJson.musicList[lookMusic].id){
      addOp.selected = true;
    }
  }  
}

//soflanMusicListJson.MusicListを名称昇順に並び替え
function sortByName(){
  if(!isReadSoflanMusicList){
    return;
  }
  soflanMusicListJson.musicList.sort((a,b) => {
    if(a.read.toLowerCase()> b.read.toLowerCase()){
      return 1;
    }
    if(a.read.toLowerCase() < b.read.toLowerCase()){
      return -1;
    }
  })
}

//soflanMusicListJson.MusicListをバージョン昇順に並び替え
function sortByVersionAsc(){
  if(!isReadSoflanMusicList){
    return;
  }
  soflanMusicListJson.musicList.sort((a,b) => {
    if(a.ver > b.ver){
      return 1;
    }
    if(a.ver == b.ver){
      if(a.read.toLowerCase()> b.read.toLowerCase()){
        return 1;
      }
      if(a.read.toLowerCase() < b.read.toLowerCase()){
        return -1;
      }    
    }
    if(a.ver < b.ver){
      return -1;
    }
  })
}

//soflanMusicListJson.MusicListをバージョン降順に並び替え
function sortByVersionDesc(){
  if(!isReadSoflanMusicList){
    return;
  }
  soflanMusicListJson.musicList.sort((a,b) => {
    if(a.ver < b.ver){
      return 1;
    }
    if(a.ver == b.ver){
      if(a.read> b.read){
        return 1;
      }
      if(a.read.toLowerCase() < b.read.toLowerCase()){
        return -1;
      }    
    }
    if(a.ver > b.ver){
      return -1;
    }
  })
}

//soflanMusicListJson.MusicListをソフラン値降順に並び替え
function sortBySoflan(){
  if(!isReadSoflanMusicList){
    return;
  }
  soflanMusicListJson.musicList.sort((a,b) => {
    if(a.soflan < b.soflan){
      return 1;
    }
    if(a.soflan == b.soflan){
      if(a.read> b.read){
        return 1;
      }
      if(a.read.toLowerCase() < b.read.toLowerCase()){
        return -1;
      }    
    }
    if(a.soflan > b.soflan){
      return -1;
    }
  })
}

async function pageLoad(){
  //ソフランリストのJSONデータの読み込み
  try{
    const soflanMusicListJsonUrl = "http://127.0.0.1:5500/soflan-music-list.json";
    //const soflanMusicListJsonUrl = "https://soflan-memo.github.io/main/soflan-music-list.json";
    const soflanMusicListJsonResponse = await fetch(soflanMusicListJsonUrl);
    soflanMusicListJson = await soflanMusicListJsonResponse.json();
    isReadSoflanMusicList = true;
  }catch(readJsonError){
    alert('楽曲データが読み込めませんでした！');
    return;
  }
  //名前順でソートしたSelectを作成
  createSelectSortByName();


  let mainDiv = document.getElementById('MAIN_DIV')  
  //musicListごとにDIV要素を作成し、BPMリストを展開してtableを作成
  for(let musicListIdx in soflanMusicListJson.musicList){
    //楽曲別のDIV要素
    let lookMusic = soflanMusicListJson.musicList[musicListIdx];
    let musicDiv = document.createElement('div');
    musicDiv.id = lookMusic.id + '_DIV';
    musicDiv.dataset.musicId = lookMusic.id;
    musicDiv.dataset.divMusic = '';
    musicDiv.style.display = 'none';
    mainDiv.appendChild(musicDiv);

    //タイトルを付与
    let musicTitle = document.createElement('div');
    musicTitle.dataset.divMusicTitle = '';
    musicTitle.innerText = lookMusic.title; 
    musicTitle.style.display = 'none';
    musicDiv.appendChild(musicTitle);
    
    //楽曲テーブルの作成
    let musicTbl = document.createElement('table');
    musicTbl.id = lookMusic.id + '_TBL'
    musicTbl.dataset.tableMusic = '';
    musicTbl.dataset.musicId = lookMusic.id;
    musicTbl.border ="1";
    musicDiv.appendChild(musicTbl);

    //colgroup要素
    let musicColGp = document.createElement('colgroup');
    musicTbl.appendChild(musicColGp)
    let musicColArr = ['col-add-remove','col-action','col-input-value','col-bpm','col-green','col-hs','col-sud','col-lift','col-memo'];
    for(let musicColArrIdx = 0;musicColArrIdx < musicColArr.length;musicColArrIdx++){
      let musicCol = document.createElement('col');
      musicCol.classList.add(musicColArr[musicColArrIdx]);
      musicColGp.appendChild(musicCol);
    }

    //ヘッダー要素
    let musicThead = document.createElement('thead');
    musicTbl.appendChild(musicThead);

    //ヘッダーダブル用譜面    
    let doubleDifTr =  document.createElement('tr');
    musicThead.appendChild(doubleDifTr);

    let doubleDifLeftBlankTd =  document.createElement('td');
    doubleDifLeftBlankTd.colSpan = 1;
    doubleDifTr.appendChild(doubleDifLeftBlankTd);

    let doubleDifTd =  document.createElement('td');
    doubleDifTd.colSpan = 7;
    doubleDifTd.style.textAlign = 'center';
    let dpnA = document.createElement('a');
    dpnA.innerText = 'DPN';
    dpnA = createTextageLink(dpnA,'D','N',lookMusic.DPN,lookMusic.textage);
    doubleDifTd.appendChild(dpnA);
    doubleDifTd.innerHTML = doubleDifTd.innerHTML + '　'; //スペーサーとして全角スペースを利用
    let dphA = document.createElement('a');
    dphA.innerText = 'DPH';
    dphA = createTextageLink(dphA,'D','H',lookMusic.DPH,lookMusic.textage);
    doubleDifTd.appendChild(dphA);
    doubleDifTd.innerHTML = doubleDifTd.innerHTML + '　';
    let dpaA = document.createElement('a');
    dpaA.innerText = 'DPA';
    dpaA = createTextageLink(dpaA,'D','A',lookMusic.DPA,lookMusic.textage);
    doubleDifTd.appendChild(dpaA);
    doubleDifTd.innerHTML = doubleDifTd.innerHTML + '　';
    let dplA = document.createElement('a');
    dplA.innerText = 'DPL';
    dplA = createTextageLink(dplA,'D','X',lookMusic.DPL,lookMusic.textage);
    doubleDifTd.appendChild(dplA);
    doubleDifTr.appendChild(doubleDifTd); 

    let doubleDifRightBlankTd =  document.createElement('td');
    doubleDifRightBlankTd.colSpan = 1;
    doubleDifTr.appendChild(doubleDifRightBlankTd);

    //ヘッダーシングル用譜面
    let singleDifTr = document.createElement('tr');
    musicThead.appendChild(singleDifTr);

    let single1pDifLeftBlankTd =  document.createElement('td');
    single1pDifLeftBlankTd.colSpan = 1;
    single1pDifLeftBlankTd.innerText = '1P';
    single1pDifLeftBlankTd.style.textAlign = 'right';
    singleDifTr.appendChild(single1pDifLeftBlankTd);

    //ヘッダーシングル譜面1P側
    let single1pDifTd =  document.createElement('td');
    single1pDifTd.colSpan = 3;
    single1pDifTd.style.textAlign = 'center';
    let sp1nA = document.createElement('a');
    sp1nA.innerText = 'SPN';
    sp1nA = createTextageLink(sp1nA,'1','N',lookMusic.SPN,lookMusic.textage);
    single1pDifTd.appendChild(sp1nA);
    single1pDifTd.innerHTML = single1pDifTd.innerHTML + '　';
    let sp1hA = document.createElement('a');
    sp1hA.innerText = 'SPH';
    sp1hA = createTextageLink(sp1hA,'1','H',lookMusic.SPH,lookMusic.textage);
    single1pDifTd.appendChild(sp1hA);
    single1pDifTd.innerHTML = single1pDifTd.innerHTML + '　';
    let sp1aA = document.createElement('a');
    sp1aA.innerText = 'SPA';
    sp1aA = createTextageLink(sp1aA,'1','A',lookMusic.SPA,lookMusic.textage);
    single1pDifTd.appendChild(sp1aA);
    single1pDifTd.innerHTML = single1pDifTd.innerHTML + '　';
    let sp1lA = document.createElement('a');
    sp1lA.innerText = 'SPL';
    sp1lA = createTextageLink(sp1lA,'1','X',lookMusic.SPL,lookMusic.textage);
    single1pDifTd.appendChild(sp1lA);
    singleDifTr.appendChild(single1pDifTd);

    //ヘッダーシングル譜面2P側
    let single2pDifTd =  document.createElement('td');
    single2pDifTd.colSpan = 4;
    single2pDifTd.style.textAlign = 'center';
    let sp2nA = document.createElement('a');
    sp2nA.innerText = 'SPN';
    sp2nA = createTextageLink(sp2nA,'2','N',lookMusic.SPN,lookMusic.textage);
    single2pDifTd.appendChild(sp2nA);
    single2pDifTd.innerHTML = single2pDifTd.innerHTML + '　';
    let sp2hA = document.createElement('a');
    sp2hA.innerText = 'SPH';
    sp2hA = createTextageLink(sp2hA,'2','H',lookMusic.SPH,lookMusic.textage);
    single2pDifTd.appendChild(sp2hA);
    single2pDifTd.innerHTML = single2pDifTd.innerHTML + '　';
    let sp2aA = document.createElement('a');
    sp2aA.innerText = 'SPA';
    sp2aA = createTextageLink(sp2aA,'2','A',lookMusic.SPA,lookMusic.textage);
    single2pDifTd.appendChild(sp2aA);
    single2pDifTd.innerHTML = single2pDifTd.innerHTML + '　';
    let sp2lA = document.createElement('a');
    sp2lA.innerText = 'SPL';
    sp2lA = createTextageLink(sp2lA,'2','X',lookMusic.SPL,lookMusic.textage);
    single2pDifTd.appendChild(sp2lA);
    singleDifTr.appendChild(single2pDifTd);

    let single2pDifRightBlankTd =  document.createElement('td');
    single2pDifRightBlankTd.colSpan = 1;
    single2pDifRightBlankTd.innerText = '2P';
    single2pDifRightBlankTd.style.textAlign = 'left';
    singleDifTr.appendChild(single2pDifRightBlankTd);


    //ヘッダー列項目の説明
    let explainTr =  document.createElement('tr');
    musicThead.appendChild(explainTr);
    let explainArr = ['操作','操作内容','入力値','BPM','緑数字','HS','SUD+','LIFT','メモ'];
    for(let explainArrIdx = 0;explainArrIdx < explainArr.length;explainArrIdx++){
      let explainTd = document.createElement('td');
      explainTd.innerText = explainArr[explainArrIdx];
      if(explainArr[explainArrIdx] == 'メモ'){
        explainTd.style.textAlign = 'left';
      }else{
        explainTd.style.textAlign = 'center';
      }

      if(explainArr[explainArrIdx] == '入力値' || explainArr[explainArrIdx] == '緑数字'){
        explainTd.style.fontSize = '0.8em';
      }

      explainTr.appendChild(explainTd);
    }

    //tbodyBPM要素
    let musicTbody = document.createElement('tbody');
    musicTbl.appendChild(musicTbody);

    //楽曲に存在するBPMの数だけtrを生成
    for(let bpmChangeCount = 0;bpmChangeCount < lookMusic.bpmList.length;bpmChangeCount++){      
      //楽曲bpmTrを追加
      addBpmTr(musicTbody,lookMusic.id,bpmChangeCount,lookMusic.bpmList[bpmChangeCount].bpm,lookMusic.bpmList[bpmChangeCount].memo,lookMusic.bpmList[bpmChangeCount].type);
    }

    //memo要素
    //ポップオーバーで解説を表示させる事を模索する形に変更
    // let musicMemoDiv = document.createElement('div');
    // musicMemoDiv.dataset.divMusicMemo = '';    
    // let musicMemoP = document.createElement('p');
    // if(lookMusic.memo !== undefined){
    //   musicMemoP.innerText = lookMusic.memo;
    // }
    // musicMemoDiv.appendChild(musicMemoP);
    // musicDiv.appendChild(musicMemoDiv);

  }

  let inputListLocalStrage = localStorage.getItem('soflan-input-list');
  if(inputListLocalStrage !== null){
    readInputList(JSON.parse(inputListLocalStrage));
  }
}

function createTextageLink(a,playSide,Scale,Difficult,textageUrl){
  if(Difficult === undefined || Difficult === null||Difficult === ''){
    return a;
  }

  let parseDifficult
  if(Difficult == '10'){
    parseDifficult = 'A';
  }else if(Difficult == '11'){
    parseDifficult = 'B';
  }else if(Difficult == '12'){
    parseDifficult = 'C';
  }else{
    parseDifficult = Difficult;
  }
  a.href = 'https://textage.cc/score' + textageUrl + '?' + playSide + Scale + parseDifficult + '00'
  a.target = '_blank';
  return a;
}

function readInputList(inputList){
  let musicTblList = document.querySelectorAll('table[data-table-music]'); //現在のテーブルリストを取得
  document.getElementById('input-default-green').value = inputList.defaultGreen;
  document.getElementById('input-default-sud').value = inputList.defaultSud;
  document.getElementById('input-default-lift').value = inputList.defaultLift;
  for(let musicTblListIdx = 0;musicTblListIdx < musicTblList.length;musicTblListIdx++){
    try{
      let targetMusicInputList = inputList.musicList.find((musicList) => musicList.id == musicTblList[musicTblListIdx].dataset.musicId);
      if(targetMusicInputList !== undefined){
        let bpmInputList = targetMusicInputList.bpmList;
        for(let bpmInputListIdx = 0;bpmInputListIdx < bpmInputList.length;bpmInputListIdx++){
          if(Array.isArray(bpmInputList[bpmInputListIdx].actionList) && bpmInputList[bpmInputListIdx].actionList.length > 0){
            for(let actionListIdx = 0; actionListIdx < bpmInputList[bpmInputListIdx].actionList.length; actionListIdx++){
              addActionTr(
                false,
                musicTblList[musicTblListIdx].dataset.musicId + '_TBL',
                bpmInputListIdx,
                bpmInputList[bpmInputListIdx].actionList[actionListIdx].actionType,
                bpmInputList[bpmInputListIdx].actionList[actionListIdx].actionValue,
                bpmInputList[bpmInputListIdx].actionList[actionListIdx].memo
              )
            }
          }
        }
      }
    }
    catch(error){
      console.log(error);
      console.log(musicTblList[musicTblListIdx].dataset.musicId + 'の入力リストの読込に失敗しました。');
    }
  }
}


function addBpmTr(Tbody,musicId,bpmChangeCount,bpm,memo,bpmType = ''){
  //BPM行tr
  let bpmTr = document.createElement('tr');
  //Trのタイプはbpm
  bpmTr.dataset.trType = 'bpm';
  //同一のbpmTr、actionTrソフラングループとして配列で取得できるようにdatasetとして行番号をdata-tr-bpmchangeを付加
  bpmTr.dataset.trBpmchange = bpmChangeCount;
  bpmTr.className = 'tr-mod' + (bpmChangeCount % 6);
  Tbody.appendChild(bpmTr);

  //操作追加ボタンtd
  //td-add-remove(削除ボタンも挿入されるセルなのでこの名称)
  let addRemoveTd = document.createElement('td');
  addRemoveTd.dataset.tdAddRemove = '';
  bpmTr.appendChild(addRemoveTd);
  
  //操作追加ボタン
  //input-add-row
  let addActionInput = document.createElement('input');
  addActionInput.name = 'input-add-row';
  addActionInput.dataset.inputAddRow = '';
  addActionInput.type = 'button';
  addActionInput.value = '追加'; 
  //function表記じゃなくてアロー関数表記でクリックイベントを付加
  //addActionInput.onclick = function(){addActionTr(musicId + '_TBL' , bpmChangeCount);}; 
  addActionInput.onclick = () => addActionTr(true,musicId + '_TBL' , bpmChangeCount); 
  addRemoveTd.appendChild(addActionInput);

  //アクションtd
  //td-action
  let actionTd = document.createElement('td');
  actionTd.dataset.tdAction = '';
  bpmTr.appendChild(actionTd);      

  //入力値td
  //td-input-value
  let inputValueTd = document.createElement('td');
  inputValueTd.dataset.tdInputValue = '';
  bpmTr.appendChild(inputValueTd);

  //BPMtd
  //td-bpm
  let bpmTd = document.createElement('td');
  bpmTd.dataset.tdBpm = '';
  bpmTd.innerText = bpm;
  //該当BPMにtype情報がある場合、Class属性として該当BPMのtype情報を付加
  if(bpmType != ''){
    bpmTd.classList.add(bpmType);
  }
  bpmTr.appendChild(bpmTd);

  //緑数字td
  //td-green
  let greenTd = document.createElement('td');
  greenTd.dataset.tdGreen = '';
  bpmTr.appendChild(greenTd);

  //HStd
  //td-hs
  let hsTd = document.createElement('td');
  hsTd.dataset.tdHs = '';
  bpmTr.appendChild(hsTd);

  //SUDtd
  //td-sud
  let sudTd = document.createElement('td');
  sudTd.dataset.tdSud = '';
  bpmTr.appendChild(sudTd);

  //LIFTtd
  //td-lift
  let litfTd = document.createElement('td');
  litfTd.dataset.tdLift = '';
  bpmTr.appendChild(litfTd);

  //memotd
  //td-memo
  let memoTd = document.createElement('td');
  memoTd.dataset.tdMemo = '';
  memoTd.innerText = memo;
  bpmTr.appendChild(memoTd);
}

function addActionTr(isNeedCalcSpeed,targetTableName,bpmChangeCount,actionType = '',actionValue = '',memo = ''){
  //getElementByIdで取得したテーブルからdataset-tr-bpmchangeで対象BPM行を取得。対象BPM行の最終行に新しく行を追加する
  let targetTable = document.getElementById(targetTableName);
  if(targetTable === null){
    return;
  }
  let bpmChangeTrs = targetTable.querySelectorAll('tr[data-tr-bpmchange="' + bpmChangeCount + '"]');
  if(bpmChangeTrs.length == 0){
    return;
  }
  let bpmChangeLastTr = bpmChangeTrs[bpmChangeTrs.length - 1];
  let insertTr = targetTable.insertRow(bpmChangeLastTr.rowIndex + 1);

  //Trのタイプはaction
  insertTr.dataset.trType = 'action';
  //同一のbpmTr、actionTrソフラングループとして配列で取得できるようにdatasetとして行番号をdata-tr-bpmchangeを付加
  insertTr.dataset.trBpmchange = bpmChangeCount;
  insertTr.className = 'tr-mod' + (bpmChangeCount % 6);

  //操作削除ボタンtd
  //td-add-remove
  let addRemoveTd = document.createElement('td');
  addRemoveTd.dataset.tdAddRemove = '';
  insertTr.appendChild(addRemoveTd)
  //操作削除ボタン
  //input-delete-row
  let deleteActionInput = document.createElement('input');
  deleteActionInput.name = 'input-delete-row';
  deleteActionInput.dataset.inputDeleteRow = '';
  deleteActionInput.type = 'button';
  deleteActionInput.value = '削除';
  //deleteActionInput.onclick = () => deleteTr(this); //アロー関数のthisではクリックしたbuttonではなくwindowが選択されてしまうためfunction形式の記述で
  deleteActionInput.onclick = function(){deleteTr(this)};
  addRemoveTd.appendChild(deleteActionInput);

  //アクションtd
  //td-action
  let actionTd = document.createElement('td');
  actionTd.dataset.tdAction = '';
  insertTr.appendChild(actionTd);

  //操作選択select
  //data-select-action
  let actionSelect = document.createElement('select');
  actionSelect.name = 'select-action';
  actionSelect.dataset.selectAction = 'ST+SCR'; //(CSS制御のため)選択されたアクションをdatasetに格納する ※初期値としてST+SCRを格納
  actionSelect.onchange = function(){changeAction(this)};
  actionTd.appendChild(actionSelect);
  //操作選択option
  let actionOptionsArr = ['ST+SCR','ST+KEY','ST→ST','ST+EFF'];
  for(let actionOptionsArrIdx = 0; actionOptionsArrIdx < actionOptionsArr.length;actionOptionsArrIdx++){
    let actionOption = document.createElement('option');
    actionOption.value = actionOptionsArr[actionOptionsArrIdx];
    actionOption.text = actionOptionsArr[actionOptionsArrIdx];
    if(actionOptionsArr[actionOptionsArrIdx] == actionType){
      actionOption.selected = true;
      actionSelect.dataset.selectAction = actionOptionsArr[actionOptionsArrIdx];
    }
    actionSelect.appendChild(actionOption);
  }

  //入力値td
  //td-input-value
  let inputValueTd = document.createElement('td');
  inputValueTd.dataset.tdInputValue = '';
  insertTr.appendChild(inputValueTd);

  //入力値elementを作成
  //el-input-value
  let inputValueEl = getInputValueElement(actionType,actionValue);
  inputValueTd.appendChild(inputValueEl);

  //BPMd
  //td-bpm
  let bpmTd = document.createElement('td');
  bpmTd.dataset.tdBpm = '';
  //BPMは該当bpmChangeTr一行目のbpmTd内のテキストを取得
  bpmTd.innerText = bpmChangeTrs[0].querySelector('td[data-td-bpm]').innerText;
  insertTr.appendChild(bpmTd);

  //緑数字td
  //td-green
  let greenTd = document.createElement('td');
  greenTd.dataset.tdGreen = '';
  insertTr.appendChild(greenTd);

  //HStd
  //td-hs
  let hsTd = document.createElement('td');
  hsTd.dataset.tdHs = '';
  insertTr.appendChild(hsTd);

  //SUDtd
  //td-sud
  let sudTd = document.createElement('td');
  sudTd.dataset.tdSud = '';
  insertTr.appendChild(sudTd);

  //LIFTtd
  //td-lift
  let litfTd = document.createElement('td');
  litfTd.dataset.tdLift = '';
  insertTr.appendChild(litfTd);

  //memotd
  //td-memo
  let memoTd = document.createElement('td');
  memoTd.dataset.tdMemo = '';
  insertTr.appendChild(memoTd);

  //memoTextarea
  //textarea-memo
  let memoTextarea = document.createElement('textarea');
  memoTextarea.name = 'textarea-memo';
  memoTextarea.dataset.textareaMemo = '';
  memoTextarea.value = memo;
  memoTextarea.onchange = function(){changeMemoValue(this)};
  memoTd.appendChild(memoTextarea);
  
  if(isNeedCalcSpeed){
    calcSpeed(targetTableName);
    localStorage.setItem('soflan-input-list', createInputListJson());
  }

}

//入力値elementの作成
//element-input-value
function getInputValueElement(actionType = '',actionValue = ''){
  if(actionType == '' || actionType == 'ST+SCR'){
    let scrValueInput = document.createElement('input');
    scrValueInput.name = 'input-scratch-value';
    scrValueInput.dataset.elementInputValue = '';
    scrValueInput.type = 'number';
    scrValueInput.onchange = function(){changeActionValue(this)};
    let scrValue = actionValue == '' ? 0 : actionValue;
    scrValueInput.value = scrValue;
    return scrValueInput;
  }else if(actionType == 'ST+KEY'){
    let keyValueSelect = document.createElement('select');
    keyValueSelect.name = 'select-key-value';
    keyValueSelect.dataset.elementInputValue = '';
    keyValueSelect.onchange = function(){changeActionValue(this)};
    let keyValue = actionValue == '' ? '0' : actionValue;
    let keyValueOptionArr = ['+20','+19','+18','+17','+16','+15','+14','+13','+12','+11','+10','+9','+8','+7','+6','+5','+4','+3','+2','+1','0','-1','-2','-3','-4','-5','-6','-7','-8','-9','-10','-11','-12','-13','-14','-15','-16','-17','-18','-19','-20'];
    for (let keyValueOptionArrIdx = 0;keyValueOptionArrIdx < keyValueOptionArr.length;keyValueOptionArrIdx++){
      let keyValueOption = document.createElement('option');
      keyValueOption.value = keyValueOptionArr[keyValueOptionArrIdx];
      keyValueOption.text = keyValueOptionArr[keyValueOptionArrIdx];
      if(keyValueOptionArr[keyValueOptionArrIdx] == keyValue){
        keyValueOption.selected = true;
      }
      keyValueSelect.appendChild(keyValueOption);
    }
    return keyValueSelect;
  }else if(actionType == 'ST→ST'){
    let showHideSudInput = document.createElement('input');
    showHideSudInput.name = 'input-show-hide-sud';
    showHideSudInput.dataset.elementInputValue = '';
    showHideSudInput.type = 'text';
    showHideSudInput.disabled = true;
    return showHideSudInput;
  }else if(actionType == 'ST+EFF'){
    let hispeedTypeSelect = document.createElement('select');
    hispeedTypeSelect.name = 'select-hispeed-type';
    hispeedTypeSelect.dataset.elementInputValue = '';
    hispeedTypeSelect.onchange = function(){changeActionValue(this)};    
    let hispeedType = actionValue == '' ? 'FHS' : actionValue;
    let hispeedTypeOptionArr = ['FHS','CHS','NHS']
    for(let hispeedTypeOptionArrIdx = 0; hispeedTypeOptionArrIdx < hispeedTypeOptionArr.length;hispeedTypeOptionArrIdx++){
      let hispeedTypeOption = document.createElement('option');
      hispeedTypeOption.value = hispeedTypeOptionArr[hispeedTypeOptionArrIdx];
      hispeedTypeOption.text = hispeedTypeOptionArr[hispeedTypeOptionArrIdx];
      if(hispeedType == hispeedTypeOptionArr[hispeedTypeOptionArrIdx]){
        hispeedTypeOption.selected = true;
      }
      hispeedTypeSelect.appendChild(hispeedTypeOption);
    }
    return hispeedTypeSelect;
  }
}

function deleteAllActionTr(){
  let actionTrList = document.querySelectorAll('tr[data-tr-type="action"]');
  for(actionTrListIdx = actionTrList.length - 1; 0 <= actionTrListIdx; actionTrListIdx--){
    actionTrList[actionTrListIdx].remove();
  }
}

function deleteTr(deleteButton){
  let deleteTable = deleteButton.closest('table');
  let deleteTr = deleteButton.closest('tr');
  deleteTr.remove();
  calcSpeed(deleteTable.id);
  localStorage.setItem('soflan-input-list', createInputListJson());
}

function changeAction(actionSelect){
  actionSelect.dataset.selectAction = actionSelect.value; //(CSS制御のため)選択されたアクションをdatasetに格納する
  let inputValueTd = actionSelect.closest('tr').querySelector('td[data-td-input-value]');
  let oldInputValueEl = inputValueTd.querySelector('[data-element-input-value]');
  oldInputValueEl.remove();
  let newInputValueEl = getInputValueElement(actionSelect.value);
  inputValueTd.appendChild(newInputValueEl);
  calcSpeed(actionSelect.closest('table').id);
  localStorage.setItem('soflan-input-list', createInputListJson());
}

function changeActionValue(acitonElement){
  calcSpeed(acitonElement.closest('table').id);
  localStorage.setItem('soflan-input-list', createInputListJson());
}

function changeMemoValue(memoElement){
  fixMemoHeight(memoElement);
  changeActionValue(memoElement);
}

function fixMemoHeight(memoElement){
  let fontSize = parseFloat(getComputedStyle(memoElement).fontSize);
  memoElement.style.height = fontSize;
  memoElement.style.height = memoElement.scrollHeight + 'px';
}

function calcSpeed(targetTableName){
  if(
      isNaN(parseInt(document.getElementById('input-default-green').value)) || 
      isNaN(parseInt(document.getElementById('input-default-sud').value)) ||
      isNaN(parseInt(document.getElementById('input-default-lift').value)) 
    ){
    return;
  }

  let targetTable = document.getElementById(targetTableName);
  if(targetTable === null){
    return;
  }

  const hsCalcBaseValue = 174728;
  const lanePx = 723; 

  const chsArr = [1.00,1.50,2.00,2.25,2.50,2.75,3.00,3.25,3.50,3.75,4.00]; //配列は[0] ～ [10]
  let currentChsArrIdx;
  const nhsArr = [1200,1000,800,700,650,600,550,500,480,460,440,420,400,380,360,340,320,300,280,260]; //配列は[0] ～ [19]
  let currentNhsArrIdx;

  let hsMode = 'FHS';
  let currentHs;

  let settingGreen = parseInt(document.getElementById('input-default-green').value);
  let currentGreen = settingGreen;

  let currentSud = parseInt(document.getElementById('input-default-sud').value);
  let isShowSud = currentSud != 0 ? true:false;
  let isUseSud  = currentSud != 0 ? true:false;

  let currentLift = parseInt(document.getElementById('input-default-lift').value);
  let isUseLift = currentLift != 0 ? true:false;


  let musicTableTrs = targetTable.tBodies[0].querySelectorAll('tr');
  for(let musicTableTrsIdx = 0;musicTableTrsIdx < musicTableTrs.length;musicTableTrsIdx++){
    let lookTr = musicTableTrs[musicTableTrsIdx]; 
    let currentBpm = lookTr.querySelector('td[data-td-bpm]').innerText //BPMを取得

    if(lookTr.dataset.trType == 'bpm'){ //bpmTrなら
      if(currentHs === undefined){ //初回(曲スタート時)はHSが存在しないため緑数字をもとにHSを算出
        currentHs = resizeHsToFhsLimit(calcHsByGreen(hsCalcBaseValue,lanePx,currentBpm,settingGreen,isShowSud ? currentSud : 0,currentLift));
        currentGreen = calcGreenByHs(hsCalcBaseValue,lanePx,currentBpm,currentHs,isShowSud ? currentSud : 0,currentLift);
      }else{ //初回以外ならbpmが変わっているのでそれに対応して緑数字を変化
        currentGreen = calcGreenByHs(hsCalcBaseValue,lanePx,currentBpm,currentHs,isShowSud ? currentSud : 0,currentLift);
      }

    }else{ //actionTrなら
      let actionType = lookTr.querySelector('td[data-td-action] select[data-select-action]').value;
      let inputValue = lookTr.querySelector('td[data-td-input-value] [data-element-input-value]').value;
      if(actionType == 'ST+SCR'){ //皿チョンなら
        inputValue = isNaN(parseInt(inputValue)) ? 0 : parseInt(inputValue); //入力値を数値に変換。数値として読み取れないなら0にしとく
        if(hsMode == 'FHS'){
          if(isShowSud){ //Sud+ありならSud+操作後、緑数字計算
            //let previousSud = currentSud; //HS計算のため操作前のSud+を保持
            //入力値をもとにSud+を再計算
            currentSud = currentSud + inputValue;
            currentSud = currentSud <= 42 ? 42 : currentSud; //Sud+下限
            currentSud = currentSud >= 999 ? 999 : currentSud; //Sud+単体の上限
            currentSud = currentSud + currentLift >= 1000 ? 1000 - currentLift : currentSud; //Sud+上限としてSud+とLiftの合計値は999まで
            currentSud = resizeWhiteValue(lanePx,currentSud)//Sud+を丸め誤差を含めた表記に 
            currentHs = resizeHsToFhsLimit(calcHsByGreen(hsCalcBaseValue,lanePx,currentBpm,settingGreen,currentSud,currentLift)); //Sud+と設定緑数字をもとにHSを再計算
            currentGreen = calcGreenByHs(hsCalcBaseValue,lanePx,currentBpm,currentHs,currentSud,currentLift);
            settingGreen = resizeGreenValue(currentGreen); //設定緑数字を元にHSが変化するけど上限引っかかったら緑数字は再設定されるはず          
          }else if(isUseLift){ //Sud+なしLiftありならLift移動
            let previousLift = currentLift; //Sud+再計算のため操作前のLiftを保持
            currentLift = currentLift + inputValue;
            currentLift = currentLift <= 0 ? 0 : currentLift; //Lift下限
            currentLift = currentLift >= 830 ? 830 : currentLift; //Lift上限
            currentLift = resizeWhiteValue(lanePx,currentLift)//Sud+を丸め誤差を含めた表記に
            if(isUseSud){ //Sud+が利用済なら変化したLiftに合わせて表示px数が同じになるようにSud+を再計算
              currentSud =  resizeWhiteValue(lanePx,resizeSudByFhsLiftStretch(lanePx,currentSud,currentLift,previousLift));
              currentGreen = calcGreenByHs(hsCalcBaseValue,lanePx,currentBpm,currentHs,0,currentLift);
            }else{ //Sud+が未使用なら緑数字を設定緑数字に合わせる
              currentHs = resizeHsToFhsLimit(calcHsByGreen(hsCalcBaseValue,lanePx,currentBpm,settingGreen,0,currentLift));
              currentGreen = calcGreenByHs(hsCalcBaseValue,lanePx,currentBpm,currentHs,0,currentLift);
              settingGreen = resizeGreenValue(currentGreen);
            }
          }else{ //Sud+もLiftもないなら設定緑数字を元に入力値ぶん設定緑数字を変化させる
            settingGreen = resizeGreenValue(currentGreen + inputValue); //いじる元の緑数字は設定緑数字ではなく表示緑数字
            currentHs = resizeHsToFhsLimit(calcHsByGreen(hsCalcBaseValue,lanePx,currentBpm,settingGreen,0,0));
            currentGreen = calcGreenByHs(hsCalcBaseValue,lanePx,currentBpm,currentHs,0,0); //HS上限を考慮した表示緑数字に
            settingGreen = currentGreen; //設定緑数字と表示緑数字を合わせる
          }
        }else{ //CHSやNHSなら入力値だけSUD+かLIFTを動かす
          if(isShowSud){
            currentSud = currentSud + inputValue;
            currentSud = currentSud <= 42 ? 42 : currentSud; //Sud+下限
            currentSud = currentSud >= 999 ? 999 : currentSud; //Sud+単体の上限
            currentSud = currentSud + currentLift >= 1000 ? 1000 - currentLift : currentSud; //Sud+上限としてSud+とLiftの合計値は999まで
            currentSud = resizeWhiteValue(lanePx,currentSud)//Sud+を丸め誤差を含めた表記に
            currentGreen = calcGreenByHs(hsCalcBaseValue,lanePx,currentBpm,currentHs,currentSud,currentLift);
          }else if(isUseLift){
            currentLift = currentLift + inputValue;
            currentLift = currentLift <= 0 ? 0 : currentLift; //Lift下限
            currentLift = currentLift >= 830 ? 830 : currentLift; //Lift上限
            currentLift = resizeWhiteValue(lanePx,currentLift)//Sud+を丸め誤差を含めた表記に
            currentSud =  resizeWhiteValue(lanePx,resizeSudByFhsLiftStretch(lanePx,currentSud,currentLift,previousLift)); //Sud+自動変化
            currentGreen = calcGreenByHs(hsCalcBaseValue,lanePx,currentBpm,currentHs,0,currentLift);
          }else{ //SudもLiftも無いなら何も変化しない。

          }
        }
      }else if(actionType == 'ST+KEY'){ //鍵盤ギアチェンなら
        if(hsMode == 'FHS'){
          currentHs = resizeHsToFhsLimit(currentHs + (inputValue * 0.5));
          currentGreen = calcGreenByHs(hsCalcBaseValue,lanePx,currentBpm,currentHs,isShowSud ? currentSud : 0,currentLift);//変更後の緑数字に合わせて表示緑数字を変更
        }else if(hsMode == 'CHS'){
          currentChsArrIdx = currentChsArrIdx + parseInt(inputValue);
          currentChsArrIdx = currentChsArrIdx <= 0 ? 0 : currentChsArrIdx;
          currentChsArrIdx = currentChsArrIdx >= (chsArr.length - 1) ? chsArr.length - 1 : currentChsArrIdx;
          currentHs = chsArr[currentChsArrIdx];
          currentGreen = calcGreenByHs(hsCalcBaseValue,lanePx,currentBpm,currentHs,isShowSud ? currentSud : 0,currentLift);
        }else if(hsMode == 'NHS'){
          currentNhsArrIdx = currentNhsArrIdx + parseInt(inputValue);
          currentNhsArrIdx = currentNhsArrIdx <= 0 ? 0 : currentNhsArrIdx;
          currentNhsArrIdx = currentNhsArrIdx >= (nhsArr.length - 1)  ? nhsArr.length - 1 : currentNhsArrIdx;
          currentHs = calcHsByGreen(hsCalcBaseValue,lanePx,currentBpm,nhsArr[currentNhsArrIdx],0,0); //NHSはHS制限が無い
          currentGreen = calcGreenByHs(hsCalcBaseValue,lanePx,currentBpm,currentHs,isShowSud ? currentSud : 0,currentLift);
        }
      }else if(actionType == 'ST→ST'){
        if(!isUseSud){ //SUD+未使用
          isUseSud = true;
          isShowSud = true;
          currentSud = 125; //SUD+ = 125として追加する。
          if(hsMode == 'FHS'){ //FHSなら設定緑数字を元にHSを再計算
            currentHs = resizeHsToFhsLimit(calcHsByGreen(hsCalcBaseValue,lanePx,currentBpm,settingGreen,currentSud,currentLift));
            currentGreen = calcGreenByHs(hsCalcBaseValue,lanePx,currentBpm,currentHs,currentSud,currentLift);
            settingGreen = resizeGreenValue(currentGreen);
          }else{//それ以外なら増えた白数字を元に表示緑数字を再計算
            currentGreen = calcGreenByHs(hsCalcBaseValue,lanePx,currentBpm,currentHs,currentSud,currentLift);
          }
        }else{
          if(isUseLift){//SUD+使用済みかつLift使用
            if(isShowSud){//Lift使用かつSUD+消しする場合
              isShowSud = false; //※SUD+消しの場合は設定緑数字は変わらない(気がする)
              if(hsMode == 'FHS'){ //LiftありからSud+を消す場合は緑数字再計算→SUd+が外れるというイメージなんだと思う
                currentHs = resizeHsToFhsLimit(calcHsByGreen(hsCalcBaseValue,lanePx,currentBpm,settingGreen,currentSud,currentLift));
                currentGreen = calcGreenByHs(hsCalcBaseValue,lanePx,currentBpm,currentHs,0,currentLift);
              }else{//Lift未使用かつSUD+消し
                currentGreen = calcGreenByHs(hsCalcBaseValue,lanePx,currentBpm,currentHs,0,currentLift); //白数字を元に表示緑数字を再計算
              }
            }else{//Lift使用かつSUD+追加する場合
              isShowSud = true;
              currentGreen = calcGreenByHs(hsCalcBaseValue,lanePx,currentBpm,currentHs,currentSud,currentLift); //増えた白数字を元に表示緑数字を計算
              settingGreen = resizeGreenValue(currentGreen); //HS上限などを考慮した上で設定緑数字が再設定されている(と思う)
            }
          }else{//SUD+使用済みかつLift未使用
            if(isShowSud){//Lift未使用かつSud+消しする場合
              isShowSud = false;
              currentGreen = calcGreenByHs(hsCalcBaseValue,lanePx,currentBpm,currentHs,0,currentLift); //消えた白数字を元に表示緑数字を計算
            }else{//Lift未使用かつSud+追加する場合
              isShowSud = true;
              if(hsMode == 'FHS'){ //FHSなら元々存在するSUDと設定緑数字を元に再計算
                currentHs = resizeHsToFhsLimit(calcHsByGreen(hsCalcBaseValue,lanePx,currentBpm,settingGreen,currentSud,currentLift));
                currentGreen = calcGreenByHs(hsCalcBaseValue,lanePx,currentBpm,currentHs,currentSud,currentLift);
                settingGreen = resizeGreenValue(currentGreen); //HS上限などを考慮した上で設定緑数字が再設定されている(と思う)
              }else{ //FHS以外なら増えた白数字を元に表示緑数字を再計算
                currentGreen = calcGreenByHs(hsCalcBaseValue,lanePx,currentBpm,currentHs,currentSud,currentLift);
              }
            }
          }
        }
      }else if(actionType == 'ST+EFF'){
        if(hsMode == 'FHS'){
          if(inputValue == 'FHS'){
          }else if(inputValue == 'CHS'){
            currentChsArrIdx = findChsIdx(chsArr,currentHs);
            currentHs = chsArr[currentChsArrIdx];
            currentGreen = calcGreenByHs(hsCalcBaseValue,lanePx,currentBpm,currentHs,isShowSud ? currentSud : 0,currentLift);
            hsMode = 'CHS';
          }else if(inputValue == 'NHS'){
            currentNhsArrIdx = findNhsIdx(nhsArr,lanePx,currentGreen,isShowSud ? currentSud : 0,currentLift);
            currentHs = calcHsByGreen(hsCalcBaseValue,lanePx,currentBpm,nhsArr[currentNhsArrIdx],0,0);
            currentGreen = calcGreenByHs(hsCalcBaseValue,lanePx,currentBpm,currentHs,isShowSud ? currentSud : 0,currentLift);
            hsMode = 'NHS';
          }
        }else if(hsMode == 'CHS'){
          if(inputValue == 'FHS'){
            settingGreen = resizeGreenValue(currentGreen);
            hsMode = 'FHS';
          }else if(inputValue == 'CHS'){

          }else if(inputValue == 'NHS'){ //本来はできない処理
            currentNhsArrIdx = findNhsIdx(nhsArr,lanePx,currentGreen,isShowSud ? currentSud : 0,currentLift);
            currentHs = calcHsByGreen(hsCalcBaseValue,lanePx,currentBpm,nhsArr[currentNhsArrIdx],0,0);
            currentGreen = calcGreenByHs(hsCalcBaseValue,lanePx,currentBpm,currentHs,isShowSud ? currentSud : 0,currentLift);
            hsMode = 'NHS';
          }
        }else if(hsMode == 'NHS'){
          if(inputValue == 'FHS'){
            settingGreen = resizeGreenValue(currentGreen);
            hsMode = 'FHS';
          }else if(inputValue == 'CHS'){

          }else if(inputValue == 'NHS'){ //本来はできない処理
            currentNhsArrIdx = findNhsIdx(nhsArr,lanePx,currentGreen,isShowSud ? currentSud : 0,currentLift);
            currentHs = calcHsByGreen(hsCalcBaseValue,lanePx,currentBpm,nhsArr[currentNhsArrIdx],0,0);
            currentGreen = calcGreenByHs(hsCalcBaseValue,lanePx,currentBpm,currentHs,isShowSud ? currentSud : 0,currentLift);
            hsMode = 'NHS';
          }          
        }
      }
    } //actionTr処理終わり
    
    //設定緑数字と現在緑数字の差を求める
    let marginGreen;
    if(parseInt(document.getElementById('input-default-green').value) - currentGreen > 0){
      if(currentGreen == 0){
        marginGreen = 1;
      }else{
        marginGreen = Math.min((1 - parseInt(document.getElementById('input-default-green').value) / currentGreen) * -4,1)
      }
    }else{
      if(currentGreen == 0){
        marginGreen = 1;
      }else{
        marginGreen = Math.min((1 - parseInt(document.getElementById('input-default-green').value) / currentGreen) * 3,1)
      }
    }

    //計算結果をhtmlに反映
    let tdGreen = lookTr.querySelector('td[data-td-green]');
    tdGreen.innerText = currentGreen;
    tdGreen.style.color = 'hsl(' + (130 - marginGreen * 70) +  ', 100%, 50%)';

    let tsHs = lookTr.querySelector('td[data-td-hs]');
    if(hsMode == 'NHS'){
      tsHs.innerHTML = currentHs.toFixed(2) + '<BR>(' + (currentNhsArrIdx + 1) + ')';
    }
    else{
      tsHs.innerHTML = currentHs.toFixed(2); //HSは小数点以下二桁まで表示
    }

    let tdSud = lookTr.querySelector('td[data-td-sud]');
    tdSud.innerText = isShowSud ? currentSud : 0;

    let tdLift = lookTr.querySelector('td[data-td-lift]');
    tdLift.innerText = currentLift;
  }
}

function findNhsIdx(nhsArr,lanePx,Green,Sud,Lift){
  let nhsNearestIdx;
  let nhsNearestDif = Infinity;
  if(Green == 0 || Sud + Lift >= 999){ //緑数字が0の場合は？
    return 0;
  }
  for(let nhsArrIdx = 0;nhsArrIdx < nhsArr.length;nhsArrIdx++){
    let visiblePx = lanePx - calcPxFromWhite(lanePx,Sud) - calcPxFromWhite(lanePx,Lift);
    if(Math.abs(Green - (nhsArr[nhsArrIdx] * (visiblePx / lanePx))) <= nhsNearestDif){
      nhsNearestIdx = nhsArrIdx;
      nhsNearestDif = Math.abs(Green - (nhsArr[nhsArrIdx] * (visiblePx / lanePx)));
    }
  }
  return nhsNearestIdx;
}

function findChsIdx(chsArr,Hs){
  let chsNearestIdx;
  let chsNearestDif = Infinity;
  for(let chsArrIdx = 0;chsArrIdx < chsArr.length;chsArrIdx++){
    if(Math.abs(Hs - chsArr[chsArrIdx]) <= chsNearestDif){
      chsNearestIdx = chsArrIdx;
      chsNearestDif = Math.abs(Hs - chsArr[chsArrIdx]);
    }
  }
  return chsNearestIdx;
}

function resizeSudByFhsLiftStretch(lanePx,Sud,currentLift,previousLift){
  //現在の白数字合計 = 過去の白数字合計 となるようにLiftが変化したらSud+を変化させる。
  //それはつまり現Sud + 現Lift = 過去Sud + 過去Liftなので
  //それに合致するように変化後のSudPxを取得
  let currentSudPx = calcPxFromWhite(lanePx,Sud) + calcPxFromWhite(lanePx,previousLift) - calcPxFromWhite(lanePx,currentLift);
  //下限、上限pxの補正
  currentSudPx = currentSudPx <= 30 ? 30 : currentSudPx;
  currentSudPx =  currentSudPx + calcPxFromWhite(lanePx,currentLift) >= lanePx ? lanePx - calcPxFromWhite(lanePx,currentLift) : currentSudPx; //上限を超える事はない気がするけど
  return calcWhiteFromPx(lanePx,currentSudPx); //px値を白数字に変換してreturn
}


function calcHsByGreen(hsCalcBaseValue,lanePx,bpm,green,sud,lift){
  if (sud + lift >= 999){
    return 0.5; //FHS以外でこの関数が呼び出されるかどうかはチェック(フルシャッターでHSが0.5になるのはFHSだけなので)
  }
  let visiblePx = lanePx - calcPxFromWhite(lanePx,sud) - calcPxFromWhite(lanePx,lift);
  return hsCalcBaseValue * (1/bpm)  * (1/green) * (visiblePx/lanePx);
}

function calcGreenByHs(hsCalcBaseValue,lanePx,bpm,hs,sud,lift){
  if(sud + lift >= 999){
    return 0;
  }
  let visiblePx = lanePx - calcPxFromWhite(lanePx,sud) - calcPxFromWhite(lanePx,lift);
  return Math.round(hsCalcBaseValue * (1/bpm)  * (1/hs) * (visiblePx/lanePx));
}

function resizeGreenValue(greenValue){
  if(greenValue <= 10){
    return 10;
  }else if(greenValue >= 9999){
    return 9999;
  }else{
    return greenValue;
  }  
}

function calcPxFromWhite(lanePx,whiteValue){
  return Math.floor(whiteValue * lanePx / 999);
}

function calcWhiteFromPx(lanePx,WhitePx){
  return Math.ceil(WhitePx * 999 / lanePx);
}

function resizeWhiteValue(lanePx,whiteValue){
  return calcWhiteFromPx(lanePx,calcPxFromWhite(lanePx,whiteValue));
}

function resizeHsToFhsLimit(hs){
  if(hs <= 0.5){
    return 0.5;
  }else if(hs >= 10){
    return 10;
  }else{
    return hs;
  }
}

function calcSpeedAll(){
  if(
      isNaN(parseInt(document.getElementById('input-default-green').value)) || 
      isNaN(parseInt(document.getElementById('input-default-sud').value)) ||
      isNaN(parseInt(document.getElementById('input-default-lift').value))                  
    ){
    return;
  }

  for(let musicListIdx in soflanMusicListJson.musicList){
      calcSpeed(soflanMusicListJson.musicList[musicListIdx].id + '_TBL');
  }
}

function calcSpeedFromDefaultSetting(){
  if(
      isNaN(parseInt(document.getElementById('input-default-green').value)) || 
      isNaN(parseInt(document.getElementById('input-default-sud').value)) ||
      isNaN(parseInt(document.getElementById('input-default-lift').value))                  
    ){
    return;
  }

  const lanePx = 723;
  let defaultGreen = parseInt(document.getElementById('input-default-green').value);
  let defaultSud = parseInt(document.getElementById('input-default-sud').value);
  let defaultLift = parseInt(document.getElementById('input-default-lift').value);

  defaultGreen = defaultGreen <= 0 ? 0 : defaultGreen;
  defaultGreen = defaultGreen >= 9999 ? 9999 : defaultGreen;

  defaultLift = defaultLift <= 0 ? 0 : defaultLift;
  defaultLift = defaultLift >= 830 ? 830 : defaultLift;

  if (defaultSud <= 0){
    defaultSud = 0;
  }else if(defaultSud <= 42){
    defaultSud = 42;    
  }else if(defaultSud >= 999){
    defaultSud = 999;
  }

  if(defaultSud + defaultLift >= 999){
    defaultSud = 999 - defaultLift;
    defaultGreen = 0;
  }

  document.getElementById('input-default-green').value = defaultGreen;
  document.getElementById('input-default-sud').value =  resizeWhiteValue(lanePx,defaultSud);
  document.getElementById('input-default-lift').value = resizeWhiteValue(lanePx,defaultLift);

  if(isShowAllMode){
    calcSpeedAll();
  }else{
    let lookMusic = document.getElementById('MUSIC_SELECT').value;
    let musicList = document.querySelectorAll('table[data-table-music]');
    for(let musicListIdx = 0;musicListIdx < musicList.length;musicListIdx++){
      if(musicList[musicListIdx].dataset.musicId == lookMusic){
        calcSpeed(musicList[musicListIdx].id);
      }
    }
  }
  localStorage.setItem('soflan-input-list', createInputListJson());
}
