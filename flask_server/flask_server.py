from flask import Flask, jsonify, send_from_directory
from flask_cors import CORS
import os
import ssl

app = Flask(__name__)
CORS(app)

@app.route('/get-ply-files')
def get_ply_files():
    directory = os.path.join(os.getcwd(), 'models/data_ply')
    ply_files = [f for f in os.listdir(directory) if f.endswith('.ply')]
    return jsonify(ply_files)

@app.route('/models/data_ply/<path:filename>')
def serve_ply_file(filename):
    directory = os.path.join(os.getcwd(), 'models/data_ply')
    print(f"Serving file: {filename} from {directory}")
    return send_from_directory(directory, filename)

if __name__ == '__main__':
    context = ('certs/cert.pem', 'certs/key.pem')
    app.run(debug=True, host='0.0.0.0', port=5000, ssl_context=context)
