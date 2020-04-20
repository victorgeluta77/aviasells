
const formSearch = document.querySelector('.form-search'),
       inputCitiesFrom = document.querySelector('.input__cities-from'),
       dropdownCitiesFrom = document.querySelector('.dropdown__cities-from'),
       inputCitiesTo = document.querySelector('.input__cities-to'),
       dropdownCitiesTo = document.querySelector('.dropdown__cities-to'),
       inputData = document.querySelector('.input__date-depart'),
       cheapestTicket = document.getElementById('cheapest-ticket')
       otherCheapestTickets = document.getElementById('other-cheap-tickets');
// database and API
const citiesApi='http://api.travelpayouts.com/data/ru/cities.json';
const proxy = 'https://cors-anywhere.herokuapp.com/',
       citiesApi_base = 'database/cities.json',
       API_KEY ='0763e3105417e4c781b6ad73a1b5aad4',
       calendar ='http://min-prices.aviasales.ru/calendar_preload',
       MAX_COUNT = 10;

let cities = [],
    calendarData = [];


// function

const getData = (url,callback,reject = console.error)=>{
    
    const request = new XMLHttpRequest();

    request.open('GET',url);
    request.addEventListener('readystatechange',()=>{
        // console.log(request.readyState); // статуси від сервера
        if (request.readyState !==4)return;
        // console.log(request.status);
        if (request.status === 200){
            callback(request.response)
        } else reject(request.status);
    });
    
        request.send();
  
    
}
// proxy+citiesApi = citiesApi
getData(proxy+citiesApi,(data)=>{
    cities = JSON.parse(data).filter(item=>item.name);
    cities.sort((a,b)=>a.name>b.naame ? 1:-1);
    // console.log(cities);
});

formSearch.addEventListener('submit',(event)=>{
    event.preventDefault();// make method defaultPrevented = true; when we click 'submit' a page don't start new(ne perezavantazujetsja)
    
    
    const cityFrom = cities.find((item)=>inputCitiesFrom.value === item.name);
    const cityTo = cities.find((item)=>inputCitiesTo.value === item.name)
    const formData = {
        from: cityFrom,
        to: cityTo,
        when: inputData.value    
    };
    if (formData.from && formData.to){
        const requestDate = '?depart_date='+ formData.when+
            '&origin='+formData.from.code+
            '&destination='+formData.to.code+
            '&one_way=true&token='+API_KEY;

            const requestDate2 = `?depart_date=${formData.when}&origin=${formData.from.code}&destination=${formData.to.code}`;

            // console.log(formData);
            // console.log(requestDate);
            // get  the data when we have real date
            getData(calendar+requestDate,(data)=>{
                    renderCheap(data,formData.when);
                    },error=>{
                        alert('В цьому напрямі польотів нема.');
                        inputCitiesFrom.value='';
                        inputCitiesTo.value='';
                        inputData.value='';
                        cheapestTicket.textContent='';
                        otherCheapestTickets.textContent='';
                        console.error('Error',error);
                    });
    } else {
        alert('Please, Input correct name of city !!');
    }

    
});
const getLinkAviasales = (data)=>{
    let link = 'https://www.aviasales.ru/search/';
    
    link +=data.origin;
    const date = new Date(data.depart_date);
    // console.log(date.getDate(), date.getMonth()+1);
    const day = date.getDate();
    link +=day < 10 ? '0'+day : day;
    const month = date.getMonth()+1;
    link += month <10 ? '0'+month : month;
    link += data.destination;
    link += '1';
    // console.log(link);
//https://www.aviasales.ua/search/SVX2905KGD1
    return link;
};
const createCard = (data)=>{
     const ticket = document.createElement('article');
     ticket.classList.add('ticket');

     let deep = '';
     if (data){
         deep = `
         <h3 class="agent">${data.gate}</h3>
            <div class="ticket__wrapper">
                <div class="left-side">
                    <a href="${getLinkAviasales(data)}" target ="_blank"" class="button button__buy">Купить
                        за ${data.value}₽</a>
                </div>
                <div class="right-side">
                    <div class="block-left">
                        <div class="city__from">Вылет из города
                            <span class="city__name">${getNameCity(data.origin)}</span>
                        </div>
                        <div class="date">${getDate(data.depart_date)}</div>
                    </div>

                    <div class="block-right">
                        <div class="changes">${getChanges(data.number_of_changes)}</div>
                        <div class="city__to">Город назначения:
                            <span class="city__name">${getNameCity(data.destination)}</span>
                        </div>
                    </div>
                </div>
            </div>
         `;
     } else {
         deep = '<h3>Ticket does not find for it date.</h3>';
     }
     ticket.insertAdjacentHTML('afterbegin',deep);
     return ticket;
}

const getNameCity =(code)=>{
    const objCity = cities.find((item)=>item.code === code);
    return objCity.name;
}

const getDate = (data)=>{
        return new Date(data).toLocaleString('ukr',{
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour : '2-digit',
            minute: '2-digit'
        });
}

const getChanges = (num)=>{
    if (num) return num === 1 ? 'with one transfer':'With two transfer ';
 else return ' without transfer'};

const renderCheapDay = (cheapTicket)=>{
    cheapestTicket.style.display = 'block';
    cheapestTicket.innerHTML='<h2>Самый дешевый билет на выбранную дату</h2>';

    const ticket = createCard(cheapTicket[0]);
    cheapestTicket.append(ticket);
}

const renderCheapYear = (cheapTickets)=>{
    otherCheapestTickets.style.display = 'block';
    otherCheapestTickets.innerHTML='<h2>Самые дешевые билеты на другие даты</h2>';

    cheapTickets.sort((a,b)=>a.value>b.value ? 1:-1);
    for(let i=0;i< cheapTickets.length && i <MAX_COUNT;i++){
        const tickets = createCard(cheapTickets[i]);
        otherCheapestTickets.append(tickets);
    }
    console.log(cheapTickets);
}

const renderCheap=(data,date)=>{
    const cheapTicketYear = JSON.parse(data).best_prices;

    const cheapTicketDay = cheapTicketYear.filter(item=>item.depart_date === date);

    renderCheapDay(cheapTicketDay);
    renderCheapYear(cheapTicketYear);
};

// getData(proxy+calendar+'?depart_date=2020-05-25&origin=SVX&destination=KGD&one_way=true&token='+API_KEY,(data)=>{});

// sort array include object 
const sortByName=(arr)=>{
   arr.sort((a,b)=>a.name>b.name ? 1:-1);
}


const showCity = (input,list)=>{
    list.textContent = '';
    if (input.value !== ''){
            const filterCity = cities.filter((item)=>{
            return item.name.toLowerCase().startsWith(input.value.toLowerCase());
            });
            // console.log(filterCity);
            if (filterCity.length == 1){input.value = filterCity[0]};
            filterCity.forEach((item)=>{
                const li = document.createElement('li');
                li.classList.add('dropdown__city');
                li.textContent = item.name;
                list.append(li);
            }); 
    };
    // console.log('show- ',list.textContent);
    // console.log(input.textContent);
}

const handlerCity = (event,input,list)=>{
    const target = event.target;
    if(target.tagName.toLowerCase() === 'li'){
        input.value = target.textContent;
        list.textContent = '';
    }
}

const cleanCity =(event,input,list)=>{
    if (event.code == 'Backspace') {
        input.value='';
        list.textContent = '';
    }
}
// from city
inputCitiesFrom.addEventListener('input',()=>{
    showCity(inputCitiesFrom,dropdownCitiesFrom);
});

dropdownCitiesFrom.addEventListener('click',(event)=>{
    handlerCity(event,inputCitiesFrom,dropdownCitiesFrom);
})

inputCitiesFrom.addEventListener('keydown',(event)=>{
    cleanCity(event,inputCitiesFrom,dropdownCitiesFrom);
});

// to city
inputCitiesTo.addEventListener('input',()=>{
    showCity(inputCitiesTo,dropdownCitiesTo);
});

dropdownCitiesTo.addEventListener('click',(e)=>{
        handlerCity(e,inputCitiesTo,dropdownCitiesTo);
})

inputCitiesTo.addEventListener('keydown',(e)=>{
     cleanCity(e,inputCitiesTo,dropdownCitiesTo);
});


document.addEventListener('click',(e)=>{
        let nameClassList = e.target.classList.value;
    
    if(document.getElementsByClassName('dropdown__city').length != 0){
        let elemMax = document.getElementsByClassName('dropdown__city').length;
        let parentCityFrom = document.getElementsByTagName('li')[0].parentNode.classList.value;
        let parentCityTo = document.getElementsByTagName('li')[elemMax-1].parentNode.classList.value;
        if (parentCityFrom != parentCityTo){
            dropdownCitiesTo.textContent='';
            dropdownCitiesFrom.textContent='';
            inputCitiesFrom.value = '';
            inputCitiesTo.value ='';
        };
        if (nameClassList !='input__cities-from'&& nameClassList != 'input__cities-to' && parentCityFrom == 'dropdown dropdown__cities-from') {
            inputCitiesFrom.value = '';
            dropdownCitiesFrom.textContent='';
        } 
        if(nameClassList !='input__cities-from'&& nameClassList != 'input__cities-to' && parentCityTo == 'dropdown dropdown__cities-to') {
            inputCitiesTo.value ='';
            dropdownCitiesTo.textContent='';
        }

    }
});


