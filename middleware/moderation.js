const analyzeSentiment = (req, res, next) => {
    console.log('Analyzing sentiment...');
    next();
  };
  
  // const Sentiment = require('sentiment');
  // const axios = require('axios');
  
  // const sentiment = new Sentiment();
  
  // function analyzeSentiment(req, res, next) {
    //     const result = sentiment.analyze(req.body.messageText);
    //     if (result.score < -3) {
        //         return res.status(400).send('Your message seems too negative. Please reconsider.');
        //     }
        //     next();
        // }

        
        
        const moderateContent = (req, res, next) => {
          console.log('Moderating content...');
          next();
        };
        
        module.exports = { analyzeSentiment, moderateContent };
// async function moderateContent(req, res, next) {
//     try {
//         const response = await axios.post('https://ai-content-moderation.example.com/analyze', {
//             text: req.body.messageText
//         });
//         if (response.data.flagged) {
//             return res.status(400).send('Inappropriate content detected. Please revise your message.');
//         }
//         next();
//     } catch (error) {
//         console.error('Error with content moderation:', error);
//         res.status(500).send('Error moderating content');
//     }
// }

// module.exports = { analyzeSentiment, moderateContent };
