//ポケモンの種族値別の速度リスト
const pkmnListByBaseSpd = {};
//全ポケモンの実在する素早さの実数値のリスト
const speedListArr = [];


async function pageLoad(){
  //ポケモンリストのCSVデータの読み込み
  let pkmnCsv  
  try{
    const pkmnCsvUrl = "./pokemon-speed-list.csv";
    const pkmnCsvResponse = await fetch(pkmnCsvUrl);
    pkmnCsv = await pkmnCsvResponse.text();    
  }catch(readJsonError){
    alert('ポケモンデータが読み込めませんでした！');
    return;
  }
  //読み込みが完了したらテーブル作成
  createPkmnBaseSpeedList(pkmnCsv);
  createPkmnSpeedList();
  createPopWindow();
  createTable();
}

//CSVを読み込んでポケモンの種族値別の速度リストを作成
function createPkmnBaseSpeedList(pkmnCsv){
  const pkmnCsvArr = pkmnCsv.trim().split(/\r?\n/).map(row => row.split('\t'));
  for(const pkmnArr of pkmnCsvArr){
    AddToPkmnListByBaseSpd(pkmnArr[0],Number(pkmnArr[1]));
  }

}
//種族値に対応するポケモン名を配列に追加
function AddToPkmnListByBaseSpd(name,baseSpd){
  if(!pkmnListByBaseSpd[baseSpd]){
    pkmnListByBaseSpd[baseSpd] = [];
  }
  pkmnListByBaseSpd[baseSpd].push(name);
}

//実数値の速度ごとの配列を作成
function createPkmnSpeedList(){
  //存在しうる速度の実数値の上限分まで配列を作る
  for(let i = 0;i <= calcPkmnSpeed(Math.max(...Object.keys(pkmnListByBaseSpd)),32,1.1,2);i++){
    const spdObj = {};
    spdObj.latestSpd = [];
    spdObj.normalSpd = [];
    spdObj.semiSpd = [];
    spdObj.fastestSpd = [];
    spdObj.normalSpd15 = [];
    spdObj.semiSpd15 = [];
    spdObj.fastestSpd15 = [];
    spdObj.normalSpd20 = [];
    spdObj.semiSpd20 = [];
    spdObj.fastestSpd20 = [];
    speedListArr.push(spdObj);
  }

  //存在する素早さの種族値毎にケース別の素早さの実数値を登録する
  for(const baseSpd of Object.keys(pkmnListByBaseSpd)){
    speedListArr[calcPkmnSpeed(baseSpd,0,0.9,1)].latestSpd.push(Number(baseSpd)); //最遅を登録
    speedListArr[calcPkmnSpeed(baseSpd,0,1,1)].normalSpd.push(Number(baseSpd)); //無振
    speedListArr[calcPkmnSpeed(baseSpd,32,1,1)].semiSpd.push(Number(baseSpd)); //準速
    speedListArr[calcPkmnSpeed(baseSpd,32,1.1,1)].fastestSpd.push(Number(baseSpd)); //最速
    speedListArr[calcPkmnSpeed(baseSpd,0,1,1.5)].normalSpd15.push(Number(baseSpd)); //無振*1.5
    speedListArr[calcPkmnSpeed(baseSpd,32,1,1.5)].semiSpd15.push(Number(baseSpd)); //準速*1.5
    speedListArr[calcPkmnSpeed(baseSpd,32,1.1,1.5)].fastestSpd15.push(Number(baseSpd)); //最速*1.5
    speedListArr[calcPkmnSpeed(baseSpd,0,1,2)].normalSpd20.push(Number(baseSpd)); //無振*2
    speedListArr[calcPkmnSpeed(baseSpd,32,1,2)].semiSpd20.push(Number(baseSpd)); //準速*2
    speedListArr[calcPkmnSpeed(baseSpd,32,1.1,2)].fastestSpd20.push(Number(baseSpd)); //最速*2
  }
  //console.log(speedListArr);
}

//ケースから素早さの実数値を算出する
function calcPkmnSpeed(baseVal,effortVal,natureFactor,rankFactor){
  return Math.floor(Math.floor(Math.floor((baseVal * 2 + 31 + effortVal * 2) * 50 / 100 + 5) * natureFactor) * rankFactor);
}

//種族値に対応するポケモンの一覧のウィンドウを作成する
function createPopWindow(){
  const mainDiv = document.getElementById('main-div');
  for(const arrByBaseSpd of Object.entries(pkmnListByBaseSpd)){
    const baseSpd = arrByBaseSpd[0]; //種族値を文字列型で取得
    const pkmnArr = arrByBaseSpd[1]; //対応するポケモン名を配列で取得

    //ポケモンの一覧のウィンドウを作成
    const pkmnListDiv = document.createElement('div');
    pkmnListDiv.id = 's' + baseSpd;
    pkmnListDiv.classList.add('window');
    pkmnListDiv.addEventListener('click',() => {setFrontWindow('s' + baseSpd);});
    mainDiv.appendChild(pkmnListDiv);

    //ポケモンの一覧のヘッダー部
    const pkmnListDivHeader = document.createElement('div');
    pkmnListDivHeader.classList.add('window-header');
    pkmnListDivHeader.addEventListener('pointerdown',(event) =>  {beginDragWindow('s' + baseSpd,event);});
    pkmnListDivHeader.addEventListener('pointermove',(event) =>  {dragWindow('s' + baseSpd,event);});
    pkmnListDivHeader.addEventListener('pointerup',(event) =>  {endDragWindow('s' + baseSpd,event);});
    pkmnListDivHeader.addEventListener('pointercancel',(event) =>  {endDragWindow('s' + baseSpd,event);});
    pkmnListDiv.appendChild(pkmnListDivHeader);

    // タイトル部(〇〇族)
    const titleSpan = document.createElement('span');
    titleSpan.textContent = baseSpd + '族';
    pkmnListDivHeader.appendChild(titleSpan);

    //閉じるボタン
    const closeBtn = document.createElement('button');
    closeBtn.classList.add('close-btn');
    closeBtn.textContent = '✕';
    closeBtn.addEventListener('click', (event) => {
      event.stopPropagation(); // 親要素へのクリック伝播（バブリング）を防止
      closeWindow('s' + baseSpd);
    });
    pkmnListDivHeader.appendChild(closeBtn);

    //種族値に対応するポケモンのリスト
    const pkmnListDivDetail = document.createElement('div');
    pkmnListDiv.appendChild(pkmnListDivDetail);
    for(const pkmnName of pkmnArr){
      const pkmnSpan = document.createElement('span');
      pkmnSpan.style.display = 'block';
      pkmnSpan.textContent = pkmnName;
      pkmnListDivDetail.appendChild(pkmnSpan);
    }
  }
}

function createTable(){

  const mainDiv = document.getElementById('main-div')

  //テーブルを作成
  const spdTbl = document.createElement('table');
  spdTbl.id = 'speed-tbl'
  spdTbl.style.margin = 'auto';
  spdTbl.border = 1;
  mainDiv.appendChild(spdTbl);  

  //ヘッダー要素
  const thead = document.createElement('thead');
  spdTbl.appendChild(thead);

  const headerTr = document.createElement('tr');
  spdTbl.appendChild(headerTr);

  //シチュエーション別の名称配列
  const spdMethodArr = ['latestSpd','normalSpd','semiSpd','fastestSpd','normalSpd15','semiSpd15','fastestSpd15','normalSpd20','semiSpd20','fastestSpd20'];
  //ヘッダー行のテキスト配列
  const headerTextArr = ['実数値','最遅','無振','準速','最速','無振+1','準速+1','最速+1','無振+2','準速+2','最速+2'];
  for(let i = 0; i <headerTextArr.length;i++){
    const th = document.createElement('th');
    th.style.textAlign = 'center';
    if(i == 0){
      th.classList.add('td-speed');
    }else{
      th.classList.add('td-' + spdMethodArr[i - 1]);
    }
    th.textContent = headerTextArr[i];
    headerTr.appendChild(th);
  }

  //tbody要素
  const tbody = document.createElement('tbody');
  spdTbl.appendChild(tbody);


  //tr要素
  //const spdMethodArr = ['latestSpd','normalSpd','semiSpd','fastestSpd','normalSpd15','semiSpd15','fastestSpd15','normalSpd20','semiSpd20','fastestSpd20'];
  for(let i = speedListArr.length - 1;i > 0;i--){
    // 素早さの実数値対応するシチュエーションの種族値が存在するならtrを作成
    if(spdMethodArr.some(spdMethod => speedListArr[i][spdMethod].length > 0)){
      const tr = document.createElement('tr');
      tbody.appendChild(tr);

      //素早さの実数値のtd
      const spdTd = document.createElement('td');
      spdTd.textContent = String(i);
      spdTd.style.textAlign = 'center';
      spdTd.classList.add('td-speed');
      tr.appendChild(spdTd);

      //素早さのシチュエーションぶんのtdを生成
      for(const spdMethod of spdMethodArr){
        const td = document.createElement('td');
        td.style.textAlign = 'center';
        td.classList.add('td-' + spdMethod);
        tr.appendChild(td);

        const targetSpdList = speedListArr[i][spdMethod];
        targetSpdList.sort((a,b) => Number(b)- Number(a)); //配列の種族値を降順に並び替え
        for(const targetSpd of targetSpdList){ //対応する素早さの種族値ごとにaタグを生成
          const aTag = document.createElement('a');
          aTag.textContent = targetSpd + '族';
          aTag.style.display = 'block';
          aTag.style.cursor = 'pointer';
          aTag.style.textDecorationLine = 'underline';
          aTag.addEventListener('click',(event) => {callWindow('s' + targetSpd,event.currentTarget);});
          td.appendChild(aTag);
        }
      }
      

    }
  }
}

//以下はウィンドウの操作に関わるjavascript
let frontZIndex = 10;//最前面のdivのポジション

function callWindow(targetWindowId,callElement){
  const targetWindow = document.getElementById(targetWindowId);
  if(targetWindow.classList.contains('is-open')){ // 対象のウィンドウが表示済なら閉じる
    closeWindow(targetWindowId);
  }else{ // 対象のウィンドウが未表示なら開く
    openWindow(targetWindowId,callElement);
  }
}

function openWindow(targetWindowId,callElement){
  const targetWindow = document.getElementById(targetWindowId);
  targetWindow.classList.add('is-open');
  // ウィンドウを最前面に持っていく
  frontZIndex += 1;
  targetWindow.style.zIndex = frontZIndex;

  // 呼び出し元が把握できるなら呼び出し元の下部にウィンドウを呼び出す
  if(callElement){
    const callElementRect = callElement.getBoundingClientRect();
    targetWindow.style.top = (callElementRect.bottom + 8) + 'px';
    targetWindow.style.left = callElementRect.left + 'px';
  }
}

function closeWindow(targetWindowId){
  const targetWindow = document.getElementById(targetWindowId);
  targetWindow.classList.remove('is-open');
}

function setFrontWindow(targetWindowId){
  const targetWindow = document.getElementById(targetWindowId);
  frontZIndex += 1;
  targetWindow.style.zIndex = frontZIndex;
}

let isDrag = false;
let clickX = 0,clickY = 0;
let startX = 0,startY = 0;
function beginDragWindow(targetWindowId,event){
  const targetWindow = document.getElementById(targetWindowId);
  if(event.target.closest('.close-btn')){ //Xボタンを押したときはドラッグを開始しない
    return;
  }

  // ウィンドウを最前面に持っていく
  frontZIndex += 1;
  targetWindow.style.zIndex = frontZIndex;

  //イベントフラグをonにしてクリック時の位置を記憶させる
  isDrag = true;
  clickX = event.clientX;
  clickY = event.clientY;
  const windowRect = targetWindow.getBoundingClientRect();
  startX = windowRect.left;
  startY = windowRect.top;  
  event.target.closest('.window-header').setPointerCapture(event.pointerId); // マウスがウィンドウ外に動いても追従させる
}

function dragWindow(targetWindowId,event){
  if(!isDrag){ //dragイベントが始まっていないなら動作させない
    return;
  }
  const targetWindow = document.getElementById(targetWindowId);
  const moveX = event.clientX - clickX;
  const moveY = event.clientY - clickY;
  targetWindow.style.left = (startX + moveX) + 'px';
  targetWindow.style.top = (startY + moveY) + 'px';
}

function endDragWindow(targetWindowId,event){
  if(isDrag){
    isDrag = false;
      const header = event.target.closest('.window-header');
      if (header && header.hasPointerCapture(event.pointerId)) {
        header.releasePointerCapture(event.pointerId);
      }
  }
}
