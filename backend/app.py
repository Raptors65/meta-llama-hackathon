from flask import Flask, request, jsonify

from GroqQueryProcessor import GroqQueryProcessor

app = Flask(__name__)


@app.route('/')
def hello_world():  # put application's code here
    return 'its working!'

@app.route('/api/make-graph', methods=['GET'])
def make_graph():
    query = request.headers.get('query')

    if not query:
        return jsonify({'error': 'Query header is missing'}), 400

    processor = GroqQueryProcessor()
    result = processor.process_query(query)

    return jsonify(result), 200


if __name__ == '__main__':
    app.run()