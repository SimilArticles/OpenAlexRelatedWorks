async function queryOpenAlex() {
    const doi = document.getElementById('doiInput').value;
    const resultsDiv = document.getElementById('results');
    resultsDiv.innerHTML = 'Loading...';

    try {
        // Query OpenAlex API for the input DOI
        const response = await fetch(`https://api.openalex.org/works?filter=doi:${doi}`);
        const data = await response.json();

        if (data.results && data.results.length > 0) {
            const work = data.results[0];
            const relatedWorks = work.related_works || [];

            // Query OpenAlex API for each related work
            const relatedWorksPromises = relatedWorks.map(relatedId =>
                fetch(`https://api.openalex.org/works/${relatedId}`)
                    .then(response => response.json())
            );

            const relatedWorksData = await Promise.all(relatedWorksPromises);

            // Display results
            resultsDiv.innerHTML = '<h2>Related Works:</h2>';
            relatedWorksData.forEach(relatedWork => {
                const title = relatedWork.title || 'No title available';
                const doi = relatedWork.doi || '#';
                resultsDiv.innerHTML += `
                    <p>
                        <strong>Title:</strong> ${title}<br>
                        <strong>DOI:</strong> <a href="https://doi.org/${doi}" target="_blank">${doi}</a>
                    </p>
                `;
            });
        } else {
            resultsDiv.innerHTML = 'No results found for the given DOI.';
        }
    } catch (error) {
        console.error('Error:', error);
        resultsDiv.innerHTML = 'An error occurred while fetching data.';
    }
}
