
from flask import Flask, jsonify
from flask_cors import CORS  # Import CORS to fix cross-origin requests
import os

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

@app.route('/get-ply-files')
def get_ply_files():
    # Ensure the directory exists
    directory = os.path.join(os.getcwd(), 'models')  # Absolute path to 'models' folder

    if not os.path.exists(directory):
        return jsonify({"error": "Models directory not found"}), 500

    # List only .glb files
    ply_files = [f for f in os.listdir(directory) if f.endswith('.glb')]
    return jsonify(ply_files)

if __name__ == '__main__':
    app.run(debug=True)
