#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

PROJECT_ID="ai-agent-hub-web-portal-79fb0"
BASE_URL="https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents"

echo -e "${BLUE}🤖 Adding Google agents to Firestore...${NC}\n"

# Get access token using gcloud
echo -e "${YELLOW}🔑 Getting access token...${NC}"
ACCESS_TOKEN=$(gcloud auth print-access-token 2>/dev/null)

if [ -z "$ACCESS_TOKEN" ]; then
    echo -e "${RED}❌ Failed to get access token. Please run: gcloud auth login${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Access token obtained${NC}\n"

# Function to add agent
add_agent() {
    local agent_id=$1
    local agent_name=$2
    local description=$3
    local category=$4
    local tags=$5
    local tier=$6
    local daily_limit=$7
    local monthly_limit=$8
    
    echo -e "${YELLOW}📝 Adding ${agent_name}...${NC}"
    
    # Create the JSON payload
    local json_payload=$(cat <<EOF
{
  "fields": {
    "name": {"stringValue": "${agent_name}"},
    "description": {"stringValue": "${description}"},
    "provider": {"stringValue": "google"},
    "route": {"stringValue": "/agents/${agent_id}"},
    "visibility": {"stringValue": "public"},
    "allowedRoles": {
      "arrayValue": {
        "values": [
          {"stringValue": "admin"},
          {"stringValue": "client"},
          {"stringValue": "user"}
        ]
      }
    },
    "metadata": {
      "mapValue": {
        "fields": {
          "category": {"stringValue": "${category}"},
          "tags": {
            "arrayValue": {
              "values": ${tags}
            }
          }
        }
      }
    },
    "pricing": {
      "mapValue": {
        "fields": {
          "tier": {"stringValue": "${tier}"},
          "limits": {
            "mapValue": {
              "fields": {
                "daily": {"integerValue": "${daily_limit}"},
                "monthly": {"integerValue": "${monthly_limit}"}
              }
            }
          }
        }
      }
    }
  }
}
EOF
)

    # Make the API call
    local response=$(curl -s -X POST \
        "${BASE_URL}/agents?documentId=${agent_id}" \
        -H "Authorization: Bearer ${ACCESS_TOKEN}" \
        -H "Content-Type: application/json" \
        -d "${json_payload}")
    
    if echo "$response" | grep -q "error"; then
        echo -e "${RED}❌ Failed to add ${agent_name}${NC}"
        echo "Error: $response"
        return 1
    else
        echo -e "${GREEN}✅ Successfully added ${agent_name} (ID: ${agent_id})${NC}"
        return 0
    fi
}

# Add Gemini Chat Agent
add_agent "gemini-chat-agent" \
    "Gemini Chat Agent" \
    "Advanced conversational AI powered by Google's Gemini model. Engage in natural conversations, get help with creative tasks, research, coding, and general questions with access to current information." \
    "General AI" \
    '[{"stringValue": "conversation"}, {"stringValue": "general-purpose"}, {"stringValue": "research"}, {"stringValue": "creative"}, {"stringValue": "coding"}, {"stringValue": "analysis"}]' \
    "free" \
    "100" \
    "2000"

# Add Google Imagen Agent  
add_agent "imagen-agent" \
    "Google Imagen Agent" \
    "AI-powered image generation using Google's Imagen model. Create high-quality images from text descriptions, get help crafting effective prompts, and explore various artistic styles." \
    "Creative AI" \
    '[{"stringValue": "image-generation"}, {"stringValue": "creative"}, {"stringValue": "art"}, {"stringValue": "design"}, {"stringValue": "visual"}, {"stringValue": "prompting"}]' \
    "premium" \
    "20" \
    "500"

echo -e "\n${GREEN}🎉 All Google agents added successfully!${NC}"
echo -e "\n${BLUE}📋 Verification:${NC}"
echo -e "   • Gemini Chat Agent: https://console.firebase.google.com/project/${PROJECT_ID}/firestore/data/~2Fagents~2Fgemini-chat-agent"
echo -e "   • Google Imagen Agent: https://console.firebase.google.com/project/${PROJECT_ID}/firestore/data/~2Fagents~2Fimagen-agent"
echo -e "\n${BLUE}🚀 Test the agents at: https://ai-agent-hub-web-portal-79fb0.web.app/agents${NC}"
echo -e "\n${GREEN}✨ Script completed successfully!${NC}"
