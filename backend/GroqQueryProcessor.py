import json
from typing import Dict, Any, Optional
from json.decoder import JSONDecodeError
from groq import Groq
from dotenv import load_dotenv
import os
from util import extract_and_parse_json, Prompts


class GroqQueryProcessor:
    def __init__(self):
        """
        Initialize the GroqQueryProcessor with SDK client and templates.

        Args:
            api_key (str, optional): Groq API key for authentication.
                                   If not provided, will use GROQ_API_KEY environment variable.
        """
        load_dotenv()
        env_value = os.getenv('GROQ_API_KEY')
        print(env_value)
        self.client = Groq(api_key=env_value)

        # Template definitions for system messages
        self.initial_system_prompt = """
        You are an expert analyst. Your task is to analyze queries and provide structured understanding.
        Be thorough and precise in your analysis.
        """

        self.refinement_system_prompt = """
        You are an expert at refining and enhancing analysis. Your task is to take initial analysis
        and improve it by identifying key patterns and relationships.
        """

        self.final_system_prompt = """
        You are a JSON formatting expert. Your task is to take refined analysis and convert it into
        a perfectly structured JSON response. Always validate your JSON structure before responding.
        """

    def _make_groq_request(self, system_prompt: str, user_prompt: str, need_json: bool = False) -> Optional[str]:

        """
        Make a request to Groq using the SDK.

        Args:
            system_prompt (str): The system message to set context
            user_prompt (str): The user message to process

        Returns:
            Optional[str]: The response text or None if request fails
        """
        try:
            chat_completion = self.client.chat.completions.create(
                messages=[
                    {
                        "role": "system",
                        "content": system_prompt
                    },
                    {
                        "role": "user",
                        "content": user_prompt
                    }
                ],
                model="llama-3.1-70b-versatile",
                temperature=0.7,
                max_tokens=2048,
                top_p=1,
                stream=False,
            )

            return chat_completion.choices[0].message.content

        except Exception as e:
            print(f"Error making Groq request: {str(e)}")
            return None

    def _validate_json(self, text: str) -> Optional[Dict[str, Any]]:
        """
        Validate and parse JSON from text.

        Args:
            text (str): Text to validate as JSON

        Returns:
            Optional[Dict[str, Any]]: Parsed JSON dict or None if invalid
        """
        try:
            # Remove any potential markdown code block markers
            cleaned_text = text.replace("```json", "").replace("```", "").strip()
            return json.loads(cleaned_text)
        except JSONDecodeError as e:
            print(f"JSON validation error: {str(e)}")
            return None

    def process_query(self, query: str) -> Dict[str, Any]:
        """
        Process a query through multiple Groq requests and return JSON response.

        Args:
            query (str): The input query to process

        Returns:
            Dict[str, Any]: Processed response as JSON
        """
        try:
            # Step 1: Initial analysis
            initial_user_prompt = Prompts.step1_prompt(query)
            initial_response = self._make_groq_request(
                self.initial_system_prompt,
                initial_user_prompt
            )

            if not initial_response:
                raise Exception("Failed to get initial response from Groq")

            # Step 2: Refinement
            refinement_user_prompt = Prompts.step2_prompt(initial_response)
            refined_response = self._make_groq_request(
                self.refinement_system_prompt,
                refinement_user_prompt
            )

            if not refined_response:
                raise Exception("Failed to get refined response from Groq")

            # Step 3: Final JSON generation
            final_user_prompt = Prompts.step3_prompt(
                query,
                refined_response
            )
            final_response = self._make_groq_request(
                self.final_system_prompt,
                final_user_prompt,
                need_json=True
            )
            print(final_response)
            if not final_response:
                raise Exception("Failed to get final response from Groq")

            # Validate JSON
            json_response = self._validate_json(final_response)
            if not json_response:
                # try doing a manual parse
                json_response = extract_and_parse_json(final_response)

                # Fingers Crossed
                json_response = self._validate_json(final_response)

                if not json_response:
                    # Llama Fucked it!
                    return {
                        "error": "Failed to generate valid JSON",
                        "raw_response": final_response
                    }

            return json_response

        except Exception as e:
            return {
                "error": str(e),
                "status": "failed"
            }