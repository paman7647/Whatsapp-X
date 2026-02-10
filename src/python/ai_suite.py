import sys
import os
import json
from engine_base import PythonEngine

# Optional: Import AI libraries
try:
    from sumy.parsers.plaintext import PlaintextParser
    from sumy.nlp.tokenizers import Tokenizer
    from sumy.summarizers.lsa import LsaSummarizer
    from textblob import TextBlob
    HAS_AI_LIBS = True
except ImportError:
    HAS_AI_LIBS = False

class AISuite(PythonEngine):
    """
    Handles Advanced Text AI tasks like Summarization and Sentiment Analysis.
    """
    
    def summarize(self, data):
        """Summarize long text using LSA algorithm."""
        if not HAS_AI_LIBS:
            return "Summarization libraries not installed. Run 'pip install sumy nltk textblob'."
            
        text = data.get('text', '')
        count = data.get('count', 3) # Number of sentences
        
        if not text:
            return "Error: No text provided for summarization."
            
        parser = PlaintextParser.from_string(text, Tokenizer("english"))
        summarizer = LsaSummarizer()
        summary = summarizer(parser.document, count)
        
        return " ".join([str(sentence) for sentence in summary])

    def sentiment(self, data):
        """Analyze text sentiment."""
        if not HAS_AI_LIBS:
            return "Sentiment libraries not installed."
            
        text = data.get('text', '')
        if not text:
            return "Error: No text provided."
            
        analysis = TextBlob(text)
        # polarity: -1 to 1, subjectivity: 0 to 1
        return {
            "polarity": analysis.sentiment.polarity,
            "subjectivity": analysis.sentiment.subjectivity,
            "label": "Positive" if analysis.sentiment.polarity > 0 else "Negative" if analysis.sentiment.polarity < 0 else "Neutral"
        }

if __name__ == "__main__":
    engine = AISuite()
    engine.run()
