from flask import Flask, jsonify
from flask_cors import CORS
import os
import ssl

app = Flask(__name__)
CORS(app)  # Enable CORS

@app.route('/get-ply-files')
def get_ply_files():
    directory = os.path.join(os.getcwd(), 'models')  # or wherever your models are
    ply_files = [f for f in os.listdir(directory) if f.endswith('.ply')]
    return jsonify(ply_files)


if __name__ == '__main__':
    context = ('certs/cert.pem', 'certs/key.pem')  # Path to your SSL certificate and key
    app.run(debug=True, host='0.0.0.0', port=5000, ssl_context=context)  # This runs the server on port 8000
