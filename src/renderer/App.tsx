function App() {

    return (
        <div className="app">

            <aside className="sidebar">

                <h2>DevMetrics</h2>

                <nav>

                    <button>Dashboard</button>
                    <button>Projects</button>
                    <button>Security</button>
                    <button>Complexity</button>
                    <button>Code Smells</button>
                    <button>Benchmarks</button>
                    <button>Reports</button>

                </nav>

            </aside>

            <main className="content">

                <header>
                    <h1>Dashboard</h1>
                </header>

                <section className="cards">

                    <div className="card">
                        <span>Quality</span>
                        <strong>87%</strong>
                    </div>

                    <div className="card">
                        <span>Security Issues</span>
                        <strong>10</strong>
                    </div>

                    <div className="card">
                        <span>Code Smells</span>
                        <strong>17</strong>
                    </div>

                    <div className="card">
                        <span>Complexity</span>
                        <strong>4.2</strong>
                    </div>

                </section>

            </main>

        </div>
    );
}

export default App;