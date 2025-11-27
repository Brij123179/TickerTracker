# app.py

from flask import Flask, render_template, jsonify
from datafetch import get_top_stocks_data

app = Flask(__name__)   

app.config['SEND_FILE_MAX_AGE_DEFAULT'] = 0

@app.route('/')
def index():
    """
    मुख्य वेबपेज (index.html) को रेंडर करता है।
    """
    return render_template('index.html')

@app.route('/api/data')
def get_data():
    """
    API एंडपॉइंट जो स्टॉक डेटा को JSON फॉर्मेट में लौटाता है।
    """
    stocks = get_top_stocks_data()
    return jsonify(stocks)

if __name__ == '__main__':
    # Change port number here (e.g., 8080)
    app.run(debug=True, port=8080)
    