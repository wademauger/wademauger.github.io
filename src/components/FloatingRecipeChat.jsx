import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useDispatch } from 'react-redux';
import { setDraftRecipe } from '../reducers/recipes.reducer';
import './FloatingRecipeChat.css';

const FloatingRecipeChat = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const dispatch = useDispatch();

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const generateRecipe = useMemo(() => {
    return () => {
      const recipes = [
        {
          id: 'ai-generated-' + Date.now(),
          title: 'Classic Chocolate Chip Cookies',
          ingredients: [
            '2¼ cups all-purpose flour',
            '1 tsp baking soda',
            '1 tsp salt',
            '1 cup butter, softened',
            '¾ cup granulated sugar',
            '¾ cup packed brown sugar',
            '2 large eggs',
            '2 tsp vanilla extract',
            '2 cups chocolate chips'
          ],
          instructions: [
            'Preheat oven to 375°F (190°C).',
            'In a medium bowl, whisk together flour, baking soda, and salt.',
            'In a large bowl, cream together butter and both sugars until light and fluffy.',
            'Beat in eggs one at a time, then add vanilla.',
            'Gradually blend in flour mixture.',
            'Stir in chocolate chips.',
            'Drop rounded tablespoons of dough onto ungreased cookie sheets.',
            'Bake 9-11 minutes or until golden brown.',
            'Cool on baking sheet for 2 minutes; remove to wire rack.'
          ],
          servings: '24 cookies',
          prepTime: '15 minutes',
          cookTime: '11 minutes'
        },
        {
          id: 'ai-generated-' + Date.now(),
          title: 'Mediterranean Quinoa Bowl',
          ingredients: [
            '1 cup quinoa',
            '2 cups vegetable broth',
            '1 cucumber, diced',
            '2 tomatoes, diced',
            '½ red onion, thinly sliced',
            '½ cup Kalamata olives',
            '½ cup feta cheese, crumbled',
            '¼ cup olive oil',
            '2 tbsp lemon juice',
            '1 tsp dried oregano',
            'Salt and pepper to taste',
            '¼ cup fresh parsley, chopped'
          ],
          instructions: [
            'Rinse quinoa in a fine mesh strainer.',
            'In a medium saucepan, bring vegetable broth to a boil.',
            'Add quinoa, reduce heat to low, cover and simmer for 15 minutes.',
            'Remove from heat and let stand 5 minutes, then fluff with a fork.',
            'In a large bowl, combine cooked quinoa, cucumber, tomatoes, red onion, and olives.',
            'In a small bowl, whisk together olive oil, lemon juice, oregano, salt, and pepper.',
            'Pour dressing over quinoa mixture and toss to combine.',
            'Top with feta cheese and fresh parsley.',
            'Serve at room temperature or chilled.'
          ],
          servings: '4 servings',
          prepTime: '20 minutes',
          cookTime: '15 minutes'
        },
        {
          id: 'ai-generated-' + Date.now(),
          title: 'Creamy Mushroom Risotto',
          ingredients: [
            '1½ cups Arborio rice',
            '6 cups warm chicken or vegetable broth',
            '1 lb mixed mushrooms, sliced',
            '1 medium onion, finely chopped',
            '3 cloves garlic, minced',
            '½ cup dry white wine',
            '3 tbsp butter',
            '2 tbsp olive oil',
            '½ cup grated Parmesan cheese',
            '2 tbsp fresh thyme',
            'Salt and pepper to taste',
            '2 tbsp fresh parsley for garnish'
          ],
          instructions: [
            'Keep broth warm in a separate pot.',
            'Heat olive oil in a large skillet and sauté mushrooms until golden. Set aside.',
            'In the same pan, melt 1 tbsp butter and cook onion until translucent.',
            'Add garlic and cook for 1 minute.',
            'Add rice and stir for 2-3 minutes until edges are translucent.',
            'Pour in wine and stir until absorbed.',
            'Add warm broth one ladle at a time, stirring constantly.',
            'Continue until rice is creamy and tender, about 18-20 minutes.',
            'Stir in cooked mushrooms, remaining butter, Parmesan, and thyme.',
            'Season with salt and pepper.',
            'Garnish with fresh parsley and serve immediately.'
          ],
          servings: '4 servings',
          prepTime: '15 minutes',
          cookTime: '25 minutes'
        }
      ];
      return recipes[Math.floor(Math.random() * recipes.length)];
    };
  }, []);

  const generateResponse = async (userMessage) => {
    setIsLoading(true);
    
    // Always suggest a recipe after the first user message
    const recipe = generateRecipe();
    
    // Set the generated recipe as the draft recipe in Redux
    dispatch(setDraftRecipe(recipe));
    
    const responses = [
      `I've created a delicious ${recipe.title} recipe for you! This recipe serves ${recipe.servings} and takes about ${recipe.prepTime} to prepare. You can see the full recipe in the main view now.`,
      `Perfect! I've generated a ${recipe.title} recipe that should be great for you. The recipe is now displayed in the main recipe view with all the ingredients and instructions.`,
      `Great idea! I've prepared a ${recipe.title} recipe for you. Check out the main recipe view to see all the details including ingredients, instructions, and timing.`
    ];
    
    const randomResponse = responses[Math.floor(Math.random() * responses.length)];
    
    setTimeout(() => {
      setMessages(prev => [...prev, {
        id: Date.now(),
        text: randomResponse,
        isUser: false,
        timestamp: new Date().toLocaleTimeString()
      }]);
      setIsLoading(false);
    }, 1000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const userMessage = {
      id: Date.now(),
      text: inputValue,
      isUser: true,
      timestamp: new Date().toLocaleTimeString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');

    await generateResponse(inputValue);
  };

  const handleClose = () => {
    setMessages([]);
    setInputValue('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="floating-chat-overlay">
      <div className="floating-chat">
        <div className="chat-header">
          <h3>Recipe AI Assistant</h3>
          <button onClick={handleClose} className="close-button">×</button>
        </div>
        
        <div className="chat-messages">
          {messages.length === 0 && (
            <div className="welcome-message">
              <p>Hi! I'm your recipe AI assistant. Tell me what kind of recipe you'd like, or just say anything to get started!</p>
            </div>
          )}
          
          {messages.map(message => (
            <div key={message.id} className={`message ${message.isUser ? 'user' : 'ai'}`}>
              <div className="message-content">
                <p>{message.text}</p>
                <span className="timestamp">{message.timestamp}</span>
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="message ai">
              <div className="message-content">
                <p>Generating a recipe for you...</p>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
        
        <form onSubmit={handleSubmit} className="chat-input-form">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Tell me what recipe you'd like..."
            className="chat-input"
            disabled={isLoading}
          />
          <button type="submit" disabled={isLoading || !inputValue.trim()} className="send-button">
            Send
          </button>
        </form>
      </div>
    </div>
  );
};

export default FloatingRecipeChat;
