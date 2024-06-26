async function queryOpenAlex() {
    const doi = document.getElementById('doiInput').value;
    const resultsDiv = document.getElementById('results');
    resultsDiv.innerHTML = 'Loading...';

    try {
        // Step 2: Query OpenAlex API with the DOI
        const response = await fetch(`https://api.openalex.org/works?filter=doi:${encodeURIComponent(doi)}`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const contentType = response.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
            throw new Error("Oops! Received non-JSON response from the server");
        }

        const data = await response.json();

        if (data.meta.count === 0) {
            resultsDiv.innerHTML = 'No results found for this DOI.';
            return;
        }

        // Step 3: Parse the response to get related works
        const relatedWorks = data.results[0].related_works || [];

        if (relatedWorks.length === 0) {
            resultsDiv.innerHTML = 'No related works found for this DOI.';
            return;
        }

        // Step 4 & 5: Query OpenAlex for each related work and display results
        const relatedWorksPromises = relatedWorks.map(async (workId) => {
            const workResponse = await fetch(`https://api.openalex.org/works/${workId}`);
            
            if (!workResponse.ok) {
                throw new Error(`HTTP error! status: ${workResponse.status}`);
            }
            
            const workData = await workResponse.json();
            return `
                <div class="related-work">
                    <a href="https://doi.org/${workData.doi}" target="_blank">${workData.title}</a>
                </div>
            `;
        });

        const relatedWorksHtml = await Promise.all(relatedWorksPromises);
        resultsDiv.innerHTML = '<h2>Related Works:</h2>' + relatedWorksHtml.join('');

    } catch (error) {
        resultsDiv.innerHTML = `An error occurred: ${error.message}. Please check the DOI and try again.`;
        console.error('Error details:', error);
    }
}
