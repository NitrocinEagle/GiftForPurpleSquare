# -*- coding: utf-8 -*-
from flask import render_template, flash, redirect, jsonify, request
from app import app,db,models
import json

@app.route('/', methods = ['GET', 'POST'])
@app.route('/index')
def index():
	return render_template('index.html', title = 'Sign In')

@app.route('/', methods = ['GET', 'POST'])
@app.route('/login')
def login():
	return 'Q'

@app.route('/addtodayguest', methods = ['POST'])
def addtodayguest():
	visitor = json.loads(request.data)
	#if int(visitor['number']) != 0:
	new_guest = models.TodayVisitors(number=int(visitor['number']), arrival_time=int(visitor['arrivalTime']))
	db.session.add(new_guest)
	db.session.commit()
	return 'Посетитель (по тарифу) с номером ' + str(visitor['number']) + ' в список текущих посетителей добавлен. Время прибытия в мс: ' + str(visitor['arrivalTime'])
	#else:
		#new_visitor = models.TodayVisitors(action=visitor['action'], price = int(visitor['price']), arrival_time = int(visitor['arrivalTime']))
#		db.session.add(new_visitor)
#		db.session.commit()
#		return u'Посетитель на мероприятие ' + visitor['action'] + u'добавлен в список текущих посетителей. Стоимость: ' + str(visitor['price']) + u' рублей.'

@app.route('/addtodayvisitor', methods = ['POST'])
def addtodayvisitor():
	visitor = json.loads(request.data)
	new_visitor = models.TodayVisitors(number = int(visitor['number']), action=visitor['action'], price = int(visitor['price']), arrival_time = int(visitor['arrivalTime']))
	db.session.add(new_visitor)
	db.session.commit()
	return u'Посетитель на мероприятие ' + visitor['action'] + u'добавлен в список текущих посетителей. Стоимость: ' + str(visitor['price']) + u' рублей.'

@app.route('/releaseguest/<guest_number>', methods = ['POST'])
def releaseguest(guest_number):
	guest = models.TodayVisitors.query.filter_by(number=guest_number).first()
	if guest != None:
		db.session.delete(guest)
		db.session.commit()
		return "Счет цены гостя под номером " + str(guest_number) + " остановлен!"
	else:
		return "Гостя под номером " + str(guest_number) + " нет!"


@app.route('/todayvisitors', methods = ['POST'])
def todayvisitors():
	data = []
	today_visitors = models.TodayVisitors.query.all()
	for visitor in today_visitors:
		if visitor.action != 'just guest':
			data.append({'action' : visitor.action, 'arrivalTime' : str(visitor.arrival_time), 'price' : str(visitor.price), 'number' : str(visitor.number)})
	return json.dumps(data)

@app.route('/todayvisitorsbytariff', methods = ['POST'])
def todayvisitorsbytariff():
	data = []
	today_visitors_tariff = models.TodayVisitors.query.all()
	for visitor in today_visitors_tariff:
		if visitor.action == 'just guest':
			data.append({'number' : str(visitor.number), 'arrivalTime' : str(visitor.arrival_time)})
	return json.dumps(data)

@app.route('/addvisitor', methods = ['POST'])
def addvisitor():
	visitor = json.loads(request.data)
	if (str(visitor['number']) != '0'):
		#new_visitor = models.Visitors(price=float(visitor['price']), action=visitor['action'], number=visitor['number'], arrival_time = int(visitor['arrivalTime']), leaving_time = int(visitor['leavingTime']))
		#db.session.add(new_visitor)
		#db.session.commit()
		print float(visitor['price'])# + ' ' + visitor['action'] + ' ' + visitor['number'] + ' ' + int(visitor['arrivalTime']) + ' ' + int(visitor['leavingTime'])
	return 'Successes'
	
@app.route('/releasevisitor/<visitor_number>,<visitor_action>', methods = ['POST'])
def releasevisitor(visitor_number, visitor_action):
	visitor = models.TodayVisitors.query.filter_by(number=visitor_number).first()
	return str(visitor.number) + u' ' + visitor.action
	#if guest != None:
#		db.session.delete(guest)
#		db.session.commit()
#		return "Счет цены гостя под номером " + str(guest_number) + " остановлен!"
#	else:
#		return "Гостя под номером " + str(guest_number) + " нет!"


@app.route('/addguest', methods = ['POST'])
def addguest():
	guest = json.loads(request.data)
	new_guest = models.TodayVisitors(number=int(guest['number']), arrival_time=str(guest['arrival_time']))
	db.session.add(new_guest)
	db.session.commit()
	return guest['number']