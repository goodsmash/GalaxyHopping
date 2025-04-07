import { useGalaxyHopping } from '../lib/stores/useGalaxyHopping';
import { formatNumber } from './utils';

export function HighScores() {
  const { highScores, setGameState } = useGalaxyHopping();
  
  // Handle back button
  const handleBack = () => {
    setGameState('mainMenu');
  };
  
  // Format date string
  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString();
    } catch (e) {
      return 'Unknown date';
    }
  };
  
  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4">
      <div className="bg-gray-900 p-8 rounded-lg max-w-2xl w-full">
        <h2 className="text-3xl font-bold text-white mb-6 text-center">High Scores</h2>
        
        {highScores.length === 0 ? (
          <div className="py-8 text-center text-gray-400">
            <p>No high scores yet</p>
            <p className="mt-2 text-sm">Play the game to set some records!</p>
          </div>
        ) : (
          <div className="mb-6 overflow-hidden rounded-lg border border-gray-700">
            <table className="w-full text-left">
              <thead className="bg-gray-800 text-gray-300">
                <tr>
                  <th className="py-3 px-4 font-semibold text-center">#</th>
                  <th className="py-3 px-4 font-semibold">Name</th>
                  <th className="py-3 px-4 font-semibold text-right">Score</th>
                  <th className="py-3 px-4 font-semibold text-center">Galaxy</th>
                  <th className="py-3 px-4 font-semibold text-right">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {highScores.map((score, index) => (
                  <tr 
                    key={index}
                    className={`
                      ${index === 0 ? 'bg-amber-900/20' : ''}
                      ${index === 1 ? 'bg-gray-600/20' : ''}
                      ${index === 2 ? 'bg-orange-800/20' : ''}
                      hover:bg-gray-800/50
                    `}
                  >
                    <td className="py-3 px-4 text-center font-bold text-gray-300">
                      {index + 1}
                    </td>
                    <td className="py-3 px-4 text-white">
                      {score.name}
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-blue-400">
                      {formatNumber(score.score)}
                    </td>
                    <td className="py-3 px-4 text-center text-green-400">
                      {score.galaxy}
                    </td>
                    <td className="py-3 px-4 text-right text-gray-400 text-sm">
                      {formatDate(score.date)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        
        <div className="flex justify-center">
          <button
            className="py-3 px-8 bg-blue-600 text-white font-bold rounded hover:bg-blue-700 transition"
            onClick={handleBack}
          >
            Back to Menu
          </button>
        </div>
      </div>
    </div>
  );
}
