async function findRelatedWorks() {
    const doi = document.getElementById('doiInput').value;
    const resultsDiv = document.getElementById('results');
    resultsDiv.innerHTML = 'Loading...';

    try {
        // Step 2: Query OpenAlex API with DOI
        const response = await fetch(`https://api.openalex.org/works?filter=doi:${doi}`);
        resultsDiv.innerHTML = `https://api.openalex.org/works?filter=doi:${doi}`
        const data = await response.json();

        if (data.results && data.results.length > 0) {
            const work = data.results[0];
            
            // Step 3: Parse the response to get related works
            const relatedWorks = work.related_works || [];

            // Step 4 & 5: Query OpenAlex API for each related work and display results
            resultsDiv.innerHTML = '<h2>Related Works:</h2>';
            
            for (const relatedWork of relatedWorks) {
                const relatedResponse = await fetch(`https://api.openalex.org/works/${relatedWork}`);
                const relatedData = await relatedResponse.json();
                
                const title = relatedData.title;
                const relatedDoi = relatedData.doi;
                
                resultsDiv.innerHTML += `
                    <div class="related-work">
                        <h3>${title}</h3>
                        <a href="https://doi.org/${relatedDoi}" target="_blank">DOI: ${relatedDoi}</a>
                    </div>
                `;
            }
        } else {
            resultsDiv.innerHTML = 'No results found for the given DOI.';
        }
    } catch (error) {
        resultsDiv.innerHTML = `An error occurred: ${error.message}`;
    }
}
