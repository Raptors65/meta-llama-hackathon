import json
import re
from typing import List, Dict, Any, Union


def extract_and_parse_json(text: str) -> List[Dict[str, Any]]:
    """
    Extracts and parses JSON objects from text, handling various formats and edge cases.

    Args:
        text (str): Input text containing one or more JSON objects

    Returns:
        List[Dict[str, Any]]: List of successfully parsed JSON objects
    """

    def clean_json_string(json_str: str) -> str:
        """Clean and prepare JSON string for parsing."""
        # Remove common formatting issues
        cleaned = json_str.strip()

        # Remove markdown code blocks if present
        cleaned = re.sub(r'```(?:json)?\s*(.*?)\s*```', r'\1', cleaned, flags=re.DOTALL)

        # Replace Unicode quotes with standard quotes
        cleaned = cleaned.replace('"', '"').replace('"', '"')
        cleaned = cleaned.replace(''', "'").replace(''', "'")

        # Remove any trailing commas before closing braces/brackets
        cleaned = re.sub(r',(\s*[}\]])', r'\1', cleaned)

        return cleaned

    def find_json_objects(text: str) -> List[str]:
        """Find potential JSON objects in text using balanced parsing."""
        results = []
        stack = []
        start = -1

        for i, char in enumerate(text):
            if char == '{':
                if not stack:
                    start = i
                stack.append(char)
            elif char == '}':
                if stack:
                    stack.pop()
                    if not stack:  # Complete object found
                        results.append(text[start:i + 1])

        return results

    def attempt_json_repair(json_str: str) -> str:
        """Attempt to repair common JSON formatting issues."""
        # Replace single quotes with double quotes for property names
        json_str = re.sub(r"'([^']+)':", r'"\1":', json_str)

        # Ensure boolean values are lowercase
        json_str = re.sub(r'\bTrue\b', 'true', json_str)
        json_str = re.sub(r'\bFalse\b', 'false', json_str)

        # Ensure null value is lowercase
        json_str = re.sub(r'\bNone\b', 'null', json_str)

        return json_str

    def parse_json_safely(json_str: str) -> Union[Dict[str, Any], None]:
        """Attempt to parse JSON with multiple fallback attempts."""
        try:
            # First attempt: direct parse
            return json.loads(json_str)
        except json.JSONDecodeError:
            try:
                # Second attempt: clean and repair
                cleaned = clean_json_string(json_str)
                repaired = attempt_json_repair(cleaned)
                return json.loads(repaired)
            except json.JSONDecodeError:
                try:
                    # Third attempt: try ast.literal_eval for Python dict syntax
                    import ast
                    parsed = ast.literal_eval(json_str)
                    # Convert to JSON and back to ensure JSON compatibility
                    return json.loads(json.dumps(parsed))
                except (SyntaxError, ValueError, json.JSONDecodeError):
                    print(f"Failed to parse JSON object: {json_str[:100]}...")
                    return None

    # Main processing
    parsed_jsons = []

    # Find all potential JSON objects
    potential_jsons = find_json_objects(text)

    # Try to parse each potential JSON object
    for json_str in potential_jsons:
        parsed = parse_json_safely(json_str)
        if parsed is not None:
            parsed_jsons.append(parsed)

    return parsed_jsons


class Prompts:
    def step1_prompt(query) -> str:
        return f"""Given the query '{query}?' identify the core issue or main question it addresses. Frame it in a way that captures the essence of the problem and highlights its importance or relevance. Expand on why this question matters and what key outcomes are expected by addressing it.
Example:
Query: "How can we reduce urban traffic congestion?"
output:
Main Question: "What factors contribute to urban traffic congestion, and how can they be mitigated?"

please follow the format for the example and don't give extra outputs, just 1 section, the Main Question"""

    def step2_prompt(main_question: str) -> str:
        return f"""
    For the main question '{main_question}' identify the major sub-main topics that relate to this question. For each sub-main topic:
* List all relevant sub-topics that explain or support it.
* Provide simple, concise explanations for each sub-topic, focusing on their role in addressing the main question.
* Ensure sub-topics are logically grouped under their corresponding sub-main topics.
Expand each sub-main topic to include all key aspects, challenges, or related factors that need consideration.
Example:

Main Topic/Question
"What causes urban traffic congestion, and how can those causes be addressed effectively?"

Sub-Main Topics and Sub-Topics
1. Public Transport
* Sub-Topics:
    1. Modes of Public Transport: Includes buses, trains, and subways.
    * Simple Explanation: Public transport reduces the dependency on private vehicles by providing mass transit options.
    1. Accessibility: Availability of stops, routes, and schedules.
    * Simple Explanation: Improved accessibility makes public transport more convenient and attractive for commuters.
    1. Challenges in Public Transport: Insufficient funding and poor maintenance.
    * Simple Explanation: Limited resources hinder the effectiveness and reliability of public transport.
2. Road Infrastructure
* Sub-Topics:
    1. Capacity: Includes roads, highways, bridges, and bike lanes.
    * Simple Explanation: Roads need to handle growing urban populations and vehicle counts effectively.
    1. Quality of Design: Traffic flow depends on the layout of roads and intersections.
    * Simple Explanation: Poorly designed infrastructure can lead to bottlenecks and slowdowns.
    1. Upgradability: Expanding or upgrading roads and bridges.
    * Simple Explanation: Urban areas often face challenges in upgrading infrastructure due to limited space or funding.
3. Technology
* Sub-Topics:
    1. Traffic Management Systems: Smart traffic lights and AI-based optimization.
    * Simple Explanation: Technology helps manage real-time traffic flow, reducing delays.
    1. Navigation Tools: GPS apps like Google Maps and Waze.
    * Simple Explanation: These tools help drivers choose less congested routes, easing overall traffic.
    1. Automation and Future Tech: Autonomous vehicles and vehicle-to-infrastructure communication.
    * Simple Explanation: Emerging technologies promise to improve traffic efficiency long-term.
4. Policies and Governance
* Sub-Topics:
    1. Congestion Pricing: Charging fees for driving during peak hours.
    * Simple Explanation: Discourages unnecessary trips during busy times.
    1. Incentives for Alternatives: Rewards for carpooling or biking.
    * Simple Explanation: Encourages people to use less congestive means of travel.
    1. Traffic Regulations: Rules like lane discipline and speed limits.
    * Simple Explanation: Enforcing traffic laws improves flow and reduces accidents.
5. Human Behavior
* Sub-Topics:
    1. Commuting Preferences: Preference for private cars over public transport.
    * Simple Explanation: Personal convenience often leads to higher private vehicle usage.
    1. Work-from-Home Trends: Reduction in commuting needs.
    * Simple Explanation: Remote work reduces the number of daily commuters.
    1. Carpooling and Shared Mobility: Use of ride-sharing services like Uber or Lyft.
    * Simple Explanation: Sharing rides reduces the overall number of vehicles on the road.

follow the same format for the output and no other text, and focus on information rich text
    """

    def step3_prompt(main_question: str, sub_main_topic: str) -> str:
        """
        Generates a prompt to describe relationships between sub-main topics and sub-topics for a given main question.

        Args:
            main_question (str): The main question under discussion.
            sub_main_topic (str): Sub-main topics and sub-topics identified for the main question.

        Returns:
            str: A detailed prompt describing relationships and expected JSON output.
        """
        return f"""
    Using the sub-main topics and sub-topics identified for the main question "{main_question}", describe the relationships between:
    * Different sub-main topics, explaining how they interact or influence each other.
    * Sub-topics within or across sub-main topics, showing their dependencies or mutual effects.

    Represent these relationships clearly and concisely in a structured format, such as a JSON-like structure, a bulleted list, or diagrams.

    This should be the format for the output JSON:
    {{
      "nodes": [
        {{
          "id": "string",              // Unique identifier for the node
          "name": "string",            // Display name for the node
          "group": "number",           // Category or group identifier (for clustering or coloring)
          "description": "string"      // Additional information about the node (optional)
        }}
      ],
      "links": [
        {{
          "source": "string",          // ID of the source node
          "target": "string",          // ID of the target node
          "description": "string"      // Optional description of the relationship
        }}
      ]
    }}

    Here is all the topic that you have right now:
    {sub_main_topic}

    Here is an example for the JSON output:
    {{
      "nodes": [
        {{ "id": "main_question", "name": "What causes urban traffic congestion?", "group": 0, "description": "How can those causes be addressed effectively?" }},
        {{ "id": "public_transport", "name": "Public Transport", "group": 1, "description": "Buses, trains, subways reduce private vehicle reliance." }},
        {{ "id": "road_infrastructure", "name": "Road Infrastructure", "group": 2, "description": "Roads, bridges, and lanes must accommodate growing vehicle numbers." }},
        {{ "id": "technology", "name": "Technology", "group": 3, "description": "Smart systems reduce bottlenecks in real-time." }},
        {{ "id": "policies_and_governance", "name": "Policies & Governance", "group": 4, "description": "Subsidies, governance improve public transport effectiveness." }},
        {{ "id": "human_behavior", "name": "Human Behavior", "group": 5, "description": "Convenience often leads to preference for private cars." }}
      ],
      "links": [
        {{ "source": "main_question", "target": "public_transport" }},
        {{ "source": "main_question", "target": "road_infrastructure" }},
        {{ "source": "main_question", "target": "technology" }},
        {{ "source": "main_question", "target": "policies_and_governance" }},
        {{ "source": "main_question", "target": "human_behavior" }}
      ]
    }}

    Please output only a valid JSON object without the next line characters in bwqt and do not edit the information.
    """.strip()
