import io
import re

try:
    content = io.open('frontend/src/App.jsx', 'r', encoding='utf-8').read()
    
    # 1. Replace the state and useEffect
    old_state_block = """function AIFeedbackLoopPage() {
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [isRatingExpanded, setIsRatingExpanded] = useState(true);
  const [is4StepsExpanded, setIs4StepsExpanded] = useState(true);
  const [isEvolutionExpanded, setIsEvolutionExpanded] = useState(true);
  const [isFlaggedExpanded, setIsFlaggedExpanded] = useState(true);
  const [isTechExpanded, setIsTechExpanded] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsPageLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);"""

    new_state_block = """function AIFeedbackLoopPage() {
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [isRatingExpanded, setIsRatingExpanded] = useState(true);
  const [is4StepsExpanded, setIs4StepsExpanded] = useState(true);
  const [isEvolutionExpanded, setIsEvolutionExpanded] = useState(true);
  const [isFlaggedExpanded, setIsFlaggedExpanded] = useState(true);
  const [isTechExpanded, setIsTechExpanded] = useState(true);
  const [promptHistory, setPromptHistory] = useState([]);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const phRes = await api.get('/prompt-history');
        setPromptHistory(phRes.data);
      } catch (err) {
        console.warn('Failed to fetch prompt history in AIFeedbackLoopPage', err);
      } finally {
        setTimeout(() => setIsPageLoading(false), 500);
      }
    };
    fetchHistory();
  }, []);"""

    content = content.replace(old_state_block, new_state_block)

    # 2. Fix the undefined metrics issue
    content = content.replace('const dbStages = (metrics?.promptHistory || []).map', 'const dbStages = (promptHistory || []).map')

    io.open('frontend/src/App.jsx', 'w', encoding='utf-8').write(content)
    print("Patched AIFeedbackLoopPage state and fetch")
except Exception as e:
    print("Error:", e)
