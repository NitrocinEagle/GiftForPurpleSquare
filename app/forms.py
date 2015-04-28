from flask.ext.wtf import Form
from wtforms import TextField, PasswordField,DecimalField
from wtforms.validators import Required, DataRequired
from app import db,models

class LoginForm(Form):
	
	def get_default_money():
		cash = models.Info.query.get(1)
		if cash is not None:
			return int(cash.money)
		else:
			return 0

	def set_default_money(self):
		self.money_in_cash.data = models.Info.query.get(1).money
		
	username = TextField('username', default = '', validators=[DataRequired()])
	password = PasswordField('password', default = '', validators=[DataRequired()])
	money_in_cash = DecimalField('money_in_cash', places = 0)
	max_check = DecimalField('max_check', places = 3, default = 350)