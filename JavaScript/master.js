const inpDateStart = document.querySelector('.inp1');
const inpDateEnd = document.querySelector('.inp2');
const divSelect = document.querySelector('.divSelect');
const currencyList = document.querySelector('.currency');
const tabl = document.querySelector('.tabl');
const week = document.querySelector('.week');
const month = document.querySelector('.month');
const year = document.querySelector('.year');
const currencyNameInTabl = document.querySelector('.currencyNameInTabl');
let workerBtn = new Worker('Workers/worker.js');

                                    //массив с валютами / Объект с выбранной валютой
let currencyArr = [];
let objToSearch;


                                         //создание перечня валют в select 
function puchCurrencyArr(data) {
    data.forEach(function(ObjCurrency) {
       let z = currencyArr.findIndex((el) => el[0].Cur_Abbreviation === ObjCurrency.Cur_Abbreviation);
      if (z != -1) {
        currencyArr[z].push(ObjCurrency);
      }else {
        currencyArr.push([ObjCurrency]); 
      }
    });
    //console.log(currencyArr)
    addCurrency(currencyArr);
    objToSearch = currencyArr[68];
  }

function addCurrency(currencyArr) {
  //console.log(currencyArr)
  let arrSort = [];

  for (let i = 0; i < currencyArr.length; i++) {
    arrSort.push({curName: currencyArr[i][0].Cur_Name,
      Cur_Abb: currencyArr[i][0].Cur_Abbreviation})
    };

  arrSort.sort(
      function (a, b) {
        if (a.curName > b.curName) {
          return 1;
        }
        if (a.curName < b.curName) {
          return -1;
        }
      }
    );

  for (let i = 0; i < arrSort.length - 1; i++) {
      currencyList.innerHTML += `<option>${arrSort[i].curName}  (${arrSort[i].Cur_Abb})</option>`
  }
  data_In_Worker(arrWorker);
};


                                                          //Выбор валюты в select
divSelect.addEventListener('change', function (event) {
    tabl.innerHTML = "";
    ChartData([0, 0]);
console.log(event.target.value.slice(-4,-1))
    objToSearch = currencyArr.find(el => el[el.length -1].Cur_Abbreviation === event.target.value.slice(-4,-1));
    pushCur_ID_In_ArrWorker(objToSearch);
    data_In_Worker(arrWorker);
    //console.log(objToSearch)
})

function pushCur_ID_In_ArrWorker(objToSearch) {
  arrWorker.curID = [];
  objToSearch.forEach((el) => arrWorker.curID.push(el.Cur_ID)) 
}


                                                                  //Seach to input
inpDateStart.addEventListener('change', inputDataInWorkerTwo)
inpDateEnd.addEventListener('change', inputDataInWorkerTwo)


function inputDataInWorkerTwo() {
  if (inpDateStart.value && inpDateEnd.value) {
    arrWorker.dataStart = inpDateStart.value;
    arrWorker.dataEnd = inpDateEnd.value;
    data_In_Worker(arrWorker);
    //console.log(arrWorker);
  }
}


                                                     //объект с данными для воркера и отправка в воркер

let arrWorker = {
  curID: [431],
  dataStart: dayjs().add(-1, 'week').format('YYYY-MM-DD'),
  dataEnd: dayjs().format('YYYY-MM-DD'),
}

function data_In_Worker(dataFile) {
    workerBtn.postMessage([dataFile]);
    //console.log('data push to worker');
};


                                                //кнопки отображения (неделя/месяц/год)
function BTN(time) {
  arrWorker.dataStart = dayjs().add(-1, time).format('YYYY-MM-DD');
  arrWorker.dataEnd = dayjs().format('YYYY-MM-DD');
  data_In_Worker(arrWorker);
}
week.addEventListener('click', BTN.bind(null, 'week'));

month.addEventListener('click', BTN.bind(null, 'month'));

year.addEventListener('click', BTN.bind(null, 'year'));




                                                   //Данные из воркера
  workerBtn.onmessage = function({data}) {
    if (data.msg) {
      valueInInput(data.datacur);
      ChartData(data.datacur)
      tabl.innerHTML = "";
      currencyNameInTabl.innerHTML = objToSearch[objToSearch.length -1].Cur_Name;
          for (let i = 0; i <= data.datacur.length-1; i++) {
            tabl.innerHTML += `<tr> <td>Дата: ${data.datacur[i].Date.slice(0,10)}</td> <td>Курс: ${data.datacur[i].Cur_OfficialRate}</td> </tr>`
          }
    } else {
      puchCurrencyArr(data);
    }
  };


                                             //установка значения для input(1/2)
function valueInInput(data) {  
  if (data.length > 1) {
    inpDateStart.value = data[data.length -1].Date.slice(0, 10);
    inpDateEnd.value = data[0].Date.slice(0, 10);
  } else {
    inpDateStart.value = "";
    inpDateEnd.value = "";
  }
}
