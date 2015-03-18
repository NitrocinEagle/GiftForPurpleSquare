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
	print request.data
	new_guest = models.TodayVisitors(number=int(visitor['number']), arrival_time=long(visitor['arrivalTime']))
	db.session.add(new_guest)
	db.session.commit()
	return 'Посетитель (по тарифу) с номером ' + str(visitor['number']) + ' в список текущих посетителей добавлен. Время прибытия в мс: ' + str(visitor['arrivalTime'])

@app.route('/addtodayvisitor', methods = ['POST'])
def addtodayvisitor():
	visitor = json.loads(request.data)
	new_visitor = models.TodayVisitors(number = int(visitor['number']), action=visitor['action'], price = int(visitor['price']), arrival_time = long(visitor['arrivalTime']))
	db.session.add(new_visitor)
	db.session.commit()
	return u'Посетитель на мероприятие ' + visitor['action'] + u'добавлен в список текущих посетителей. Стоимость: ' + str(visitor['price']) + u' рублей.'

@app.route('/releaseguest/<guest_number>', methods = ['POST'])
def releaseguest(guest_number):
	guest = models.TodayVisitors.query.filter_by(number=guest_number).first()
	if not (guest is None):
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
	new_visitor = models.Visitors(price=float(visitor['price']), action=visitor['action'], number=int(visitor['number']), arrival_time = long(visitor['arrivalTime']), leaving_time = long(visitor['leavingTime']))
	db.session.add(new_visitor)
	db.session.commit()
	return 'Success!'
	
@app.route('/releasevisitor/<visitor_number>,<visitor_action>', methods = ['POST'])
def releasevisitor(visitor_number, visitor_action):
	visitor = models.TodayVisitors.query.filter_by(number=visitor_number, action=visitor_action).first()
	if not (visitor is None):
		db.session.delete(visitor)
		db.session.commit()
		return u'Посетитель меропрития ' + visitor.action + u' с номером ' + str(visitor.number) + u' был удален'
	return 'Ошибочка! Нет такого посетителя'

@app.route('/allvisitors', methods = ['POST'])
def allvisitors():
	data = []
	allVisitors = models.Visitors.query.all()
	for visitor in allVisitors:
		if visitor.action != "Guest":
			data.append({'number' : str(visitor.number)})
	print json.dumps(data)
	return json.dumps(data)






