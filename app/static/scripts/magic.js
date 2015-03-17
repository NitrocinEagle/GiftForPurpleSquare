		function view() {
			var guestsLogList = document.getElementById("guests_log_list");
			var HTMLGuestsLogList = '<table border=\"1\"><tr><td>Номер гостя</td><td>Статус</td><td>Время прибытия</td><td>Время присутствия</td><td>Стоимость</td><td>Остановить</td><tr>';
			for (var i = 0; i < GUESTS_NUMB; i++) {
				HTMLGuestsLogList += '<tr><td>' + guests[i].number + '</td><td>Гость</td><td>' + getArrivalTime(guests[i].arrivalTime) + '</td><td>' + getAttendanceTime(guests[i].arrivalTime) + '</td><td>' + getPriceByTraffic(guests[i].arrivalTime) + ' рублей</td><td><button type=\"button\" onclick =\"releaseGuest(' + guests[i].number + ')\" id=\"guest_number_' + guests[i].number + '\">Стоп</button></td></tr>'; //<td><form id=\"' + guests[i].guest_number + '></form></td>
			}
			HTMLGuestsLogList +=  '</table>';
			guestsLogList.innerHTML = HTMLGuestsLogList;
			
			var visitorsLogList = document.getElementById("visitors_log_list");
			var HTMLVisitorsLogList = '<table border=\"1\"><tr><td>Номер гостя</td><td>Мероприятие</td><td>Время прибытия</td><td>Время присутствия</td><td>Стоимость</td><td>Остановить</td><tr>';
			for (var i = 0; i < VISITORS_NUMB; i++) {
					HTMLVisitorsLogList += '<tr><td>' + visitors[i].number + '</td><td>' + visitors[i].action + '</td><td>' + getArrivalTime(visitors[i].arrivalTime) + '</td><td>' + getAttendanceTime(visitors[i].arrivalTime) + '</td><td>' + visitors[i].price + ' рублей</td><td><button type=\"button\" onclick =\"releaseVisitor(' + i + ')\" id=\"visitorAction:' + visitors[i].action + '\">Стоп</button></td></tr>';
			}
			HTMLVisitorsLogList +=  '</table>';
			visitorsLogList.innerHTML = HTMLVisitorsLogList;
			setTodayDate();
		}
		
		function getNumberOfVisitors() {
			var maxNumber = 0;
			for (var i = 0; i < VISITORS_NUMB; i++)
				if (parseInt(visitors[i].number) > maxNumber)
					maxNumber = parseInt(visitors[i].number);
			
			var request =  new XMLHttpRequest();
			request.open('POST', '/allvisitors', false);
			request.send(null);
			var JSONVisitors = JSON.parse(request.responseText);
			for (var i = 0; i < JSONVisitors.length; i++)
				if (parseInt(JSONVisitors[i].number) > maxNumber)
					maxNumber = parseInt(JSONVisitors[i].number);
			return maxNumber + 1;
		}
		function getArrivalTime(time) {
			var time_str;
			var day = time.getDate();
			if (day < 10)
				day = '0' + day;
			var month = time.getMonth() + 1;
			if (month < 10)
				month = '0' + month;
			var hour = time.getHours();
			if (hour < 10)
				hour = '0' + hour;
			var minutes = time.getMinutes();
			if (minutes < 10)
				minutes = '0' + minutes;
			var seconds = time.getSeconds();
			if (seconds < 10)
				seconds = '0' + seconds;
			time_str = day + "." + month + "." + time.getFullYear() + " " + hour + ":" + minutes + ":" + seconds;
			return time_str;
		}
		function getAttendanceTime(time) {
			var curTime = new Date();
			var diffTime = curTime.getTime() - time.getTime();
			var time_str;
			var hour = Math.floor(diffTime / 1000 / 60 / 60) % 24;
			if (hour < 10)
				hour = '0' + hour;
			var minutes = Math.floor(diffTime / 1000 / 60)  % 60;
			if (minutes < 10)
				minutes = '0' + minutes;
			var seconds = Math.floor(diffTime / 1000) % 60;
			if (seconds < 10)
				seconds = '0' + seconds;
			time_str = hour + ":" + minutes; //+ ":" + seconds;
			return time_str;
		}
		function getTimeDifference(time1, time2) {
			var diffTime = time2.getTime() - time1.getTime();
			if (diffTime < 0)
				diffTime *= -1;
			var time_str;
			var hour = Math.floor(diffTime / 1000 / 60 / 60) % 24;
			if (hour < 10)
				hour = '0' + hour;
			var minutes = Math.floor(diffTime / 1000 / 60)  % 60;
			if (minutes < 10)
				minutes = '0' + minutes;
			var seconds = Math.floor(diffTime / 1000) % 60;
			if (seconds < 10)
				seconds = '0' + seconds;
			time_str = hour + ":" + minutes + ":" + seconds;
			return time_str;
		}
		function getPriceByTraffic(arrivalTime) {
			var curTime = new Date();
			var diffTime = curTime.getTime() - arrivalTime.getTime();
			var price = 1.5*(Math.floor(diffTime / 1000 / 60));
			if (price < TODAY_MAXIMUM_CHECK)
				return price;
			else
				return TODAY_MAXIMUM_CHECK;
		}
		
		function getTodayGuests() {
			GUESTS_NUMB = 0;
			var guests = new Array();
			var request =  new XMLHttpRequest();
			request.open('POST', '/todayvisitorsbytariff', false);
			request.send(null);
			var JSONGuests = JSON.parse(request.responseText);
			for (var i = 0; i < JSONGuests.length; i++) {
				guests[GUESTS_NUMB] = new Object();
				guests[GUESTS_NUMB].number = JSONGuests[i].number;
				guests[GUESTS_NUMB].action = "Гость";
				guests[GUESTS_NUMB].arrivalTime = new Date();
				guests[GUESTS_NUMB].arrivalTime.setTime(parseInt(JSONGuests[i].arrivalTime));
				GUESTS_NUMB++;
			}
			return guests;
		}
		function addGuest(guestSelector) {
			var index = guestSelector.selectedIndex;
			var guestNumb = parseInt(guestSelector[index].text);

			var val = "Выберите номер";
			var opts = guestSelector.options;
			for (var opt, j = 0; opt = opts[j]; j++) {
				if (opt.value == val) {
					guestSelector.selectedIndex = j;
					break;
				}
			}
			/*Если мы пытаемся "выдать" гостю номерок, который мы выдали ранее другому гостю, то такой номерок не может быть выдан! He shall not pass! */
			var guestExist = true;
			for (var i = 0; i < GUESTS_NUMB; i++) {
				if (guests[i].number == guestNumb) {
					guestExist = false;
					alert("Эй, негодник! Ты что, пытался выдать гостю номерок, который уже есть у другого гостя?!"); 
					break;
				}
			}
			if (guestExist == true) {
				guests[GUESTS_NUMB] = new Object();
				guests[GUESTS_NUMB].number = guestNumb;
				guests[GUESTS_NUMB].arrivalTime = new Date();
				
				var guest = new Object();
				guest.number = String(guests[GUESTS_NUMB].number);
				guest.arrivalTime = guests[GUESTS_NUMB].arrivalTime.getTime();//getArrivalTime(guests[GUESTS_NUMB].arrivalTime);
				
				var request =  new XMLHttpRequest();
				request.open('POST', '/addtodayguest', false);
				request.send(JSON.stringify(guest));
				alert("Отправляем серверу: " + JSON.stringify(guest));
				alert("Ответ сервера: " + request.responseText);
				GUESTS_NUMB++;
			}
			
		}
		function releaseGuest(guestNumber) {
			var request =  new XMLHttpRequest();
			request.open('POST', '/releaseguest/' + String(guestNumber), false);
			request.send(null);
			alert("Ответ сервера: " + request.responseText);
			request = null;
		
			var newGuest = new Object();
			var ind = 0;
			for (var i = 0; i < GUESTS_NUMB; i++)
				if (guests[i].number == guestNumber)
				{
					ind = i;
					break;
				}
			newGuest.number = String(guests[ind].number);
			newGuest.arrivalTime = String(guests[ind].arrivalTime.getTime());
			newGuest.leavingTime = new Date();
			newGuest.leavingTime =  String(newGuest.leavingTime.getTime());
			newGuest.price = String(getPriceByTraffic(guests[ind].arrivalTime));
			newGuest.action = "Guest";
			var JSONNewGuest = JSON.stringify(newGuest);
			request =  new XMLHttpRequest();
			request.open('POST', '/addvisitor', false);
			request.send(JSONNewGuest);
			alert("Ответ сервера: " + request.responseText);
			
			for (var i = 0; i < GUESTS_NUMB; i++)
				guests[i] = null;
			guests = null;
			
			guests = getTodayGuests();
		}

		function addVisitor() {
			var visitorPrices = document.getElementById("visitor_prices_list");
			var priceIndex = visitorPrices.selectedIndex;
			var price = visitorPrices[priceIndex].text;
			if (price != "Выберите цену")
				price = parseInt(price);

			var visitorAction = document.getElementById("visitor_action_text");
			var action = visitorAction.value;
			
			if (price != "Выберите цену" & action != "Мероприятие")
			{
				var val = "Выберите цену";
				var opts = visitorPrices.options;
				for (var opt, j = 0; opt = opts[j]; j++) {
				if (opt.value == val) {
					visitorPrices.selectedIndex = j;
					break;
					}
				}
				val = "Мероприятие";
				visitorAction.value = val;
				
				visitors[VISITORS_NUMB] = new Object();
				visitors[VISITORS_NUMB].number = numberOfVisitors;//VISITORS_NUMB+1;
				visitors[VISITORS_NUMB].price = price;
				visitors[VISITORS_NUMB].action = action;
				visitors[VISITORS_NUMB].arrivalTime =  new Date();
				numberOfVisitors++;
				
				var visitor = new Object();
				visitor.number = String(visitors[VISITORS_NUMB].number);
				visitor.arrivalTime = String(visitors[VISITORS_NUMB].arrivalTime.getTime());
				visitor.action = String(visitors[VISITORS_NUMB].action);
				visitor.price = String(visitors[VISITORS_NUMB].price);
				
				var request =  new XMLHttpRequest();
				request.open('POST', '/addtodayvisitor', false);
				
				request.send(JSON.stringify(visitor));

				alert("Отправляем серверу: " + JSON.stringify(visitor));
				alert("Ответ сервера: " + request.responseText);
				VISITORS_NUMB++;
			}
			else
				alert("Не выбрана цена или не указано мероприятие!");

			
			/*Если мы пытаемся "выдать" гостю номерок, который мы выдали ранее другому гостю, то такой номерок не может быть выдан! He shall not pass! */
			/*var guestExist = true;
			for (var i = 0; i < GUESTS_NUMB; i++) {
				if (guests[i].number == guestNumb) {
					guestExist = false;
					alert("Эй, негодник! Ты что, пытался выдать гостю номерок, который у другого гостя?!"); 
					break;
				}
			}
			if (guestExist == true) {
				guests[GUESTS_NUMB] = new Object();
				guests[GUESTS_NUMB].number = guestNumb;
				guests[GUESTS_NUMB].arrivalTime = new Date();
			}
				/*var request =  new XMLHttpRequest();
				request.open('POST', '/addguest', false);
				request.send(JSON.stringify(visitor));
				//alert("Отправляем серверу: " + JSON.stringify(visitor));
				//alert("Ответ сервера: " + request.responseText);*/
				//GUESTS_NUMB++;
			
		}
		function getTodayVisitors() {
			VISITORS_NUMB = 0;
			var visitors = new Array();
			var request =  new XMLHttpRequest();
			request.open('POST', '/todayvisitors', false);
			request.send(null);
			var JSONVisitors = JSON.parse(request.responseText);
			for (var i = 0; i < JSONVisitors.length; i++) {
				visitors[VISITORS_NUMB] = new Object();
				visitors[VISITORS_NUMB].number = parseInt(JSONVisitors[i].number);
				visitors[VISITORS_NUMB].price = parseInt(JSONVisitors[i].price);
				visitors[VISITORS_NUMB].action = JSONVisitors[i].action;
				visitors[VISITORS_NUMB].arrivalTime = new Date();
				visitors[VISITORS_NUMB].arrivalTime.setTime(parseInt(JSONVisitors[i].arrivalTime));
				VISITORS_NUMB++;
			}
			return visitors;
		}
		function releaseVisitor(visitorIndex) {
			var visitor = visitors[visitorIndex];
			
			var request = new XMLHttpRequest();
			request.open('POST', '/releasevisitor/' + String(visitors[visitorIndex].number) + ',' + String(visitors[visitorIndex].action), false);
			request.send(null);
			alert("Ответ сервера: " + request.responseText);
			request = null;
			
			var newVisitor = new Object();
			newVisitor.number = String(visitors[visitorIndex].number);
			newVisitor.action = String(visitors[visitorIndex].action);
			newVisitor.arrivalTime = String(visitors[visitorIndex].arrivalTime.getTime());
			newVisitor.leavingTime = new Date();
			newVisitor.leavingTime = String(newVisitor.leavingTime.getTime());
			newVisitor.price =  String(visitors[visitorIndex].price);
			
			request = new XMLHttpRequest();
			request.open('POST', '/addvisitor', false);
			request.send(JSON.stringify(newVisitor));
			alert("Ответ сервера: " + request.responseText);
			
			for (var i = 0; i < VISITORS_NUMB; i++)
				visitors[i] = null;
			visitors = null;
			visitors = getTodayVisitors();
		}
		
		function setNumbersOptions() {
			numbers = new Array();
			for (var i = 0; i < 45; i++) {
				numbers[i] = new Object();
				numbers[i].free = true;
				numbers[i].number = i+55;
				var guestNumbersSelector = document.getElementById("visitor_prices_list");
				var option = document.createElement("option");
				option.text = numbers[i].number;
				guest_numbers_list.add(option);
			}
		}
		function setPriceOptions() {
			for (var i = 3; i <= 20; i++) {
				var priceSelector = document.getElementById("visitor_prices_list");
				var option = document.createElement("option");
				option.text = i*50;
				priceSelector.add(option);
			}
		}
		function getTodayMaxCheck() {
			/* Берется сегодняшняя дата. 
			Скрипт, в котором делается поиск этой даты в таблице Checks. 
			Если запись в таблице найдена, берется цена из записи в таблице, иначе 350.*/
			var anotherTodayCheckExist = false;
			if (anotherTodayCheckExist)
			{
				return 150;
			}
			else
				return 350;
		}
		function setTodayDate() {
			var date = new Date();
			var todayIs = document.getElementById("todayIs");
			//alert(todayIs);
			todayIs.innerHTML = date.toLocaleDateString() + " " + date.toTimeString();
		}
	