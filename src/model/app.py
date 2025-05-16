from flask import Flask, request, jsonify
from google import genai

# Initialize Flask app and GenAI client
app = Flask(__name__)
client = genai.Client(api_key="AIzaSyAoWCUnGzd0YopqSKpb6yIhSjechjndmZA")

@app.route('/summarize', methods=['POST'])
def summarize_text():
    # Get the text from the request body
    data = request.get_json()
    text_to_summarize = data.get('text', None)
    
    if not text_to_summarize:
        return jsonify({'error': 'No text provided'}), 400

    # Define the prompt
    prompt = "Summarize this text: " + text_to_summarize
    
    try:
        # Call the GenAI model to generate the summary
        response = client.models.generate_content(
            model="gemini-2.0-flash",
            contents=[text_to_summarize, prompt]
        )

        # Return the summary
        return jsonify({'summary': response.text}), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    # Run the Flask app
    app.run(debug=True)
