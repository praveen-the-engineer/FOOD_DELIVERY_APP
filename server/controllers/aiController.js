
const Food = require('../models/Food');
const Cart = require('../models/Cart');

// Initialize Gemini
const getAI = async () => {
    if (!process.env.GEMINI_API_KEY) {
        throw new Error('Gemini API key is missing');
    }

    const { GoogleGenAI } = await import('@google/genai');

    return new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY,
        apiVersion: 'v1beta'
    });
};

// Clean Gemini JSON response
const parseAIResponse = (text) => {
    const cleaned = text
        .replace(/^```json\s*/i, '')
        .replace(/^```\s*/, '')
        .replace(/\s*```$/, '')
        .trim();

    return JSON.parse(cleaned);
};


// ======================================
// EXISTING AI FOOD RECOMMENDATION CHAT
// ======================================

const chatWithAI = async (req, res) => {
    try {
        const { message, restaurantId } = req.body;

        if (!message || typeof message !== 'string' || !message.trim()) {
            return res.status(400).json({
                success: false,
                message: 'Please enter a valid message'
            });
        }

        if (!process.env.GEMINI_API_KEY) {
            return res.status(500).json({
                success: false,
                message: 'Gemini API key is missing'
            });
        }

        const filter = {
            isAvailable: true
        };

        if (restaurantId) {
            filter.restaurantId = restaurantId;
        }

        const foods = await Food.find(filter).select(
            'name description price category restaurantId'
        );

        if (foods.length === 0) {
            return res.status(200).json({
                success: true,
                reply: 'Sorry, no food items are currently available.',
                recommendations: []
            });
        }

        const foodData = foods.map(food => ({
            id: food._id.toString(),
            name: food.name,
            description: food.description,
            price: food.price,
            category: food.category,
            restaurantId: food.restaurantId
        }));

        const ai = await getAI();

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',

            contents: `
Customer request:
${message.trim()}

Available food items:
${JSON.stringify(foodData)}

Recommend suitable items using ONLY the available food list.

Rules:
1. Never invent food items or prices.
2. Consider budget and preferences.
3. Return valid JSON only.
4. Return this format:
{
  "reply": "Friendly explanation",
  "recommendedFoodIds": ["actual_database_id"]
}
5. Include at most 5 food IDs.
`,

            config: {
                systemInstruction:
                    'You are Foodie AI. Recommend only real food items from the provided database. Return valid JSON without markdown.'
            }
        });

        const aiResult = parseAIResponse(response.text);

        const validIds = new Set(
            foodData.map(food => food.id)
        );

        const recommendedIds = Array.isArray(
            aiResult.recommendedFoodIds
        )
            ? aiResult.recommendedFoodIds
                .filter(id => validIds.has(id))
                .slice(0, 5)
            : [];

        const recommendations = foodData.filter(food =>
            recommendedIds.includes(food.id)
        );

        return res.status(200).json({
            success: true,
            reply: aiResult.reply || 'Here are some food suggestions.',
            recommendations
        });

    } catch (error) {
        console.error('Gemini AI Error:', error);

        if (error.status === 503) {
            return res.status(503).json({
                success: false,
                message: 'AI service is temporarily busy. Please try again.'
            });
        }

        if (error.status === 429) {
            return res.status(429).json({
                success: false,
                message: 'AI usage limit reached. Please try again later.'
            });
        }

        return res.status(500).json({
            success: false,
            message: 'Unable to generate AI recommendations. Please try again.'
        });
    }
};


// ======================================
// AI VOICE CART COMMANDS
// ======================================

const handleVoiceCartCommand = async (req, res) => {
    try {
        const { message } = req.body;

        if (!message || typeof message !== 'string' || !message.trim()) {
            return res.status(400).json({
                success: false,
                message: 'Please provide a voice command'
            });
        }

        const ai = await getAI();

        // Fetch actual available food items
        const foods = await Food.find({
            isAvailable: true
        }).select('name category price');

        const foodData = foods.map(food => ({
            id: food._id.toString(),
            name: food.name,
            category: food.category,
            price: food.price
        }));

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',

            contents: `
Customer voice command:
"${message.trim()}"

Available food items from MongoDB:
${JSON.stringify(foodData)}

Identify the customer's intended cart operation.

Return valid JSON ONLY in this format:
{
  "action": "add",
  "foodIds": ["database_id"],
  "quantity": 2,
  "reply": "Friendly response"
}

Allowed actions:
- add
- remove
- view
- clear
- none

Rules:
1. Only use IDs from the available food list.
2. Never invent food names or IDs.
3. For add and remove, return ALL matching food IDs if the customer has not specified which item they mean.
4. If multiple items match, return all their IDs so the application can ask the customer to choose.
5. For add, identify the requested quantity. Default to 1.
6. For remove, identify the food item.
7. For view, the customer wants to see their cart.
8. For clear, the customer wants to empty their cart.
9. If the customer is only asking for recommendations or general information, use action none.
10. Do not claim that an operation has already been completed.
`,

            config: {
                systemInstruction:
                    'You are Foodie AI, a voice-assisted food ordering assistant. ' +
                    'Identify customer intent accurately. ' +
                    'Use only actual database food IDs. ' +
                    'Return valid JSON without markdown.'
            }
        });

        const result = parseAIResponse(response.text);

        const allowedActions = [
            'add',
            'remove',
            'view',
            'clear',
            'none'
        ];

        if (!allowedActions.includes(result.action)) {
            return res.status(400).json({
                success: false,
                reply: 'Sorry, I could not understand that command.'
            });
        }

        // General conversation or unsupported command
        if (result.action === 'none') {
            return res.status(200).json({
                success: true,
                action: 'none',
                reply: result.reply || 'How can I help you with your food order?'
            });
        }

        // Get logged-in customer's cart
        let cart = await Cart.findOne({
            user: req.user.id
        });

        // VIEW CART
        if (result.action === 'view') {
            if (!cart) {
                return res.status(200).json({
                    success: true,
                    action: 'view',
                    reply: 'Your cart is currently empty.',
                    cart: {
                        items: [],
                        totalPrice: 0
                    }
                });
            }

            cart = await cart.populate('items.food');

            const totalPrice = cart.items.reduce(
                (total, item) => {
                    return total + (
                        item.food.price * item.quantity
                    );
                },
                0
            );

            return res.status(200).json({
                success: true,
                action: 'view',
                reply: 'Here is your current cart.',
                cart,
                totalPrice
            });
        }

        // CLEAR CART
        if (result.action === 'clear') {
            if (!cart) {
                return res.status(200).json({
                    success: true,
                    action: 'clear',
                    reply: 'Your cart is already empty.'
                });
            }

            cart.items = [];
            await cart.save();

            return res.status(200).json({
                success: true,
                action: 'clear',
                reply: 'Your cart has been cleared successfully.'
            });
        }

        // Validate food IDs against MongoDB
        const validIds = new Set(
            foodData.map(food => food.id)
        );

        const matchedIds = Array.isArray(result.foodIds)
            ? [...new Set(
                result.foodIds.filter(id => validIds.has(id))
            )]
            : [];

        // No matching food
        if (matchedIds.length === 0) {
            return res.status(200).json({
                success: true,
                action: result.action,
                reply: 'Sorry, I could not find that food item in our menu.'
            });
        }

        // Ask customer when multiple foods match
        if (matchedIds.length > 1) {
            const matchedFoods = foodData.filter(food =>
                matchedIds.includes(food.id)
            );

            return res.status(200).json({
                success: true,
                action: 'clarify',
                reply:
                    'I found multiple matching food items. Please specify which one you want: ' +
                    matchedFoods.map(food => food.name).join(', '),
                matchingFoods: matchedFoods
            });
        }

        const foodId = matchedIds[0];

        const food = await Food.findById(foodId);

        if (!food || !food.isAvailable) {
            return res.status(404).json({
                success: false,
                reply: 'Sorry, this food item is currently unavailable.'
            });
        }

        // ADD FOOD
        if (result.action === 'add') {
            const quantity = Number(result.quantity || 1);

            if (
                !Number.isInteger(quantity) ||
                quantity < 1 ||
                quantity > 20
            ) {
                return res.status(400).json({
                    success: false,
                    reply: 'Please choose a quantity between 1 and 20.'
                });
            }

            if (!cart) {
                cart = new Cart({
                    user: req.user.id,
                    items: []
                });
            }

            const existingItem = cart.items.find(
                item => item.food.toString() === foodId
            );

            if (existingItem) {
                existingItem.quantity += quantity;
            } else {
                cart.items.push({
                    food: foodId,
                    quantity
                });
            }

            await cart.save();

            return res.status(200).json({
                success: true,
                action: 'add',
                reply: `${quantity} ${food.name} added to your cart successfully.`,
                food: {
                    id: food._id,
                    name: food.name,
                    price: food.price
                }
            });
        }

        // REMOVE FOOD
        if (result.action === 'remove') {
            if (!cart) {
                return res.status(200).json({
                    success: true,
                    action: 'remove',
                    reply: 'Your cart is already empty.'
                });
            }

            const existingItem = cart.items.find(
                item => item.food.toString() === foodId
            );

            if (!existingItem) {
                return res.status(200).json({
                    success: true,
                    action: 'remove',
                    reply: `${food.name} is not in your cart.`
                });
            }

            cart.items = cart.items.filter(
                item => item.food.toString() !== foodId
            );

            await cart.save();

            return res.status(200).json({
                success: true,
                action: 'remove',
                reply: `${food.name} has been removed from your cart.`
            });
        }

    } catch (error) {
        console.error('Voice Cart Error:', error);

        return res.status(500).json({
            success: false,
            message: 'Unable to process your voice cart command.'
        });
    }
};

module.exports = {
    chatWithAI,
    handleVoiceCartCommand
};
