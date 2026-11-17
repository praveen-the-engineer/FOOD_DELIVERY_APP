
const Food = require('../models/Food');

// Convert text into useful keywords
const getKeywords = (text) => {
    const stopWords = [
        'with', 'and', 'the', 'for', 'from',
        'this', 'that', 'are', 'is', 'a',
        'an', 'of', 'in', 'to'
    ];

    return text
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, '')
        .split(/\s+/)
        .filter(word =>
            word.length > 2 && !stopWords.includes(word)
        );
};

// Calculate similarity between two food items
const calculateSimilarity = (food1, food2) => {
    let score = 0;

    // Same category
    if (
        food1.category.toLowerCase() ===
        food2.category.toLowerCase()
    ) {
        score += 5;
    }

    // Same restaurant
    if (food1.restaurantId === food2.restaurantId) {
        score += 3;
    }

    // Similar price
    const priceDifference = Math.abs(
        food1.price - food2.price
    );

    const maxPrice = Math.max(
        food1.price,
        food2.price,
        1
    );

    const priceSimilarity =
        1 - priceDifference / maxPrice;

    score += Math.max(0, priceSimilarity) * 2;

    // Compare names and descriptions
    const words1 = new Set(
        getKeywords(`${food1.name} ${food1.description}`)
    );

    const words2 = new Set(
        getKeywords(`${food2.name} ${food2.description}`)
    );

    const commonWords = [...words1].filter(word =>
        words2.has(word)
    );

    const totalWords = new Set([
        ...words1,
        ...words2
    ]).size;

    if (totalWords > 0) {
        score += (commonWords.length / totalWords) * 3;
    }

    return score;
};

// Get similar food recommendations
const getRecommendations = async (req, res) => {
    try {
        const { id } = req.params;

        // Find selected food
        const selectedFood = await Food.findById(id);

        if (!selectedFood) {
            return res.status(404).json({
                success: false,
                message: 'Food item not found'
            });
        }

        // Fetch other available food items
        const availableFoods = await Food.find({
            isAvailable: true,
            _id: { $ne: selectedFood._id }
        });

        // Calculate similarity and rank results
        const scoredFoods = availableFoods
            .map(food => ({
                food,
                score: calculateSimilarity(
                    selectedFood,
                    food
                )
            }))
            .filter(item => item.score > 0)
            .sort((a, b) => b.score - a.score);

        // Remove duplicate food names
        const uniqueFoods = [];
        const seenNames = new Set();

        for (const item of scoredFoods) {
            const normalizedName =
                item.food.name.trim().toLowerCase();

            if (!seenNames.has(normalizedName)) {
                seenNames.add(normalizedName);
                uniqueFoods.push(item.food);
            }

            if (uniqueFoods.length === 5) {
                break;
            }
        }

        return res.status(200).json({
            success: true,
            message: 'Similar food recommendations generated successfully',
            basedOn: {
                foodId: selectedFood._id,
                foodName: selectedFood.name,
                category: selectedFood.category,
                restaurantId: selectedFood.restaurantId
            },
            recommendations: uniqueFoods
        });

    } catch (error) {
        console.error('Recommendation Error:', error);

        return res.status(500).json({
            success: false,
            message: 'Unable to generate recommendations'
        });
    }
};

module.exports = {
    getRecommendations
};
