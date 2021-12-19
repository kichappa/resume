import logo from './logo.svg';
import './App.css';
import Portfolio from './components/Portfolio';

function App() {
    return (
        <div className="App">
            <div id="portfolios">
                <Portfolio
                    title="UX Portfolio"
                    link=""
                    desc="Here are the works I did in User Experience Design. These include wireframes and prototypes made for my intern at HeyPrescribe!, coursework and hobby."
                />
                <Portfolio
                    title="Design Portfolio"
                    link=""
                    desc="This is my general design portfolio. These are works done primarily for coursework or hobby."
                />
            </div>
        </div>
    );
}

export default App;
