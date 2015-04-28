# -*- coding: utf-8 -*-
from app import db

ROLE_USER = 0
ROLE_ADMIN = 1

class User(db.Model):
	id = db.Column(db.Integer, primary_key=True, autoincrement=True)
	nickname = db.Column(db.String(64), index=True, unique=True)
	password = db.Column(db.String(64), index=True)
	role = db.Column(db.Integer, index=True, default=ROLE_USER)

	def is_authenticated(self):
		return True
	
	def is_active(self):
		return True

	def is_anonymous(self):
		return False

	def get_id(self):
		try:
			return unicode(self.id)  # python 2
		except NameError:
			return str(self.id)  # python 3

	def __repr__(self):
		return '<User %r>' % (self.nickname)

class Info(db.Model):
	id = db.Column(db.Integer, primary_key=True, autoincrement=True)
	money = db.Column(db.Integer, default = 0) # Количество денег в кассе на текущий момент
	session_start = db.Column(db.String(16)) # Время начала смены в мс
	today_check = db.Column(db.Integer, default = 350) # Сегодняшний максимальный чек
	
class CashLog(db.Model):
	id = db.Column(db.Integer, primary_key=True, autoincrement=True)
	withdrawn = db.Column(db.Integer) # Количество денег снятых или добавленных в кассу
	comment = db.Column(db.String(128)) # Комментарий к снятию или добавлению денег
	time = db.Column(db.String(16)) # Время снятия денег 

class TodayVisitors(db.Model):
	id = db.Column(db.Integer, primary_key=True, autoincrement=True)
	number = db.Column(db.Integer, primary_key = False, default=0)
	#action = db.Column(db.String(64), primary_key = False, default="just guest")
	price = db.Column(db.Integer, primary_key = False, default=0)
	arrival_time = db.Column(db.String(16), primary_key = False)
	comment = db.Column(db.String(128), default="")
	
class Visitors(db.Model):
	id = db.Column(db.Integer, primary_key=True, autoincrement=True)
	comment = db.Column(db.String(128), default="")
	number = db.Column(db.Integer, primary_key = False, default=0)
	arrival_time = db.Column(db.String(16), primary_key = False)
	leaving_time = db.Column(db.String(16), primary_key = False)
	price = db.Column(db.Float, primary_key = False, default=0)
	
class TodayActions(db.Model):
	id = db.Column(db.Integer, primary_key=True, autoincrement=True)
	participant_id = db.Column(db.Integer)
	name = db.Column(db.String(64))
	by_tariff = db.Column(db.Boolean, default=False)
	start_time = db.Column(db.String(16))
	price = db.Column(db.Integer, default=0)
	comment = db.Column(db.String(128), default="")

#  Мероприятие Началось Закончилось Участник Заплатил Комментарий
class Actions(db.Model):
	id = db.Column(db.Integer, primary_key=True, autoincrement=True)
	participant_id = db.Column(db.Integer)
	name = db.Column(db.String(64), primary_key = False)
	start_time = db.Column(db.String(16), primary_key = False)
	end_time = db.Column(db.String(16))
	price = db.Column(db.Integer, default=0)
	comment = db.Column(db.String(128), default="")
	
class SystemLog(db.Model):
	id = db.Column(db.Integer, primary_key=True, autoincrement=True)
	visitor = db.Column(db.String(64))
	arrival_time = db.Column(db.String(16))
	leaving_time = db.Column(db.String(16))
	price = db.Column(db.Integer, default=0)
	comment = db.Column(db.String(128), default="")