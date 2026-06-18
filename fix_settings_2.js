const fs = require('fs');

let content = fs.readFileSync('frontend/src/App.jsx', 'utf8');

// 1. handleGenerate (try block)
content = content.replace(
  /setResultGreeting\(generatedGreeting\);\s*loadGreetingsHistory\(\);\s*\}\s*catch \(/,
  `setResultGreeting(generatedGreeting);
        loadGreetingsHistory();
        if (localStorage.getItem('settings_notifyGenerate') !== 'false') {
          setAlertMessage('AI Greeting generated successfully!');
        }
      } catch (`
);

// 1. handleGenerate (catch block)
content = content.replace(
  /setResultGreeting\(generatedGreeting\);\s*loadGreetingsHistory\(\);\s*\}\s*setLoading\(false\);/,
  `setResultGreeting(generatedGreeting);
        loadGreetingsHistory();
        if (localStorage.getItem('settings_notifyGenerate') !== 'false') {
          setAlertMessage('AI Greeting generated successfully!');
        }
      }
      setLoading(false);`
);

// 2. submitFeedback
content = content.replace(
  /saveFeedbackLocally\(resultGreeting\.id, rating, feedbackComments\);\s*\} catch \(e\) \{/,
  `saveFeedbackLocally(resultGreeting.id, rating, feedbackComments);
      if (localStorage.getItem('settings_notifyFeedback') !== 'false') {
        setAlertMessage('Feedback submitted successfully!');
      }
    } catch (e) {`
);

content = content.replace(
  /saveFeedbackLocally\(resultGreeting\.id, rating, feedbackComments\);\s*setFeedbackSaved\(true\);\s*\}\s*\};/,
  `saveFeedbackLocally(resultGreeting.id, rating, feedbackComments);
      setFeedbackSaved(true);
      if (localStorage.getItem('settings_notifyFeedback') !== 'false') {
        setAlertMessage('Feedback saved locally!');
      }
    }
  };`
);

fs.writeFileSync('frontend/src/App.jsx', content);
console.log('Fixed handleGenerate and submitFeedback');
