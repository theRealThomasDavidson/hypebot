# GauntletAI Demo Day Showcase - Private Implementation Notes





## Current Implementation Status

### Core Features Status
- [ ] Home Page Implementation
- [ ] Student Detail Pages
- [ ] Search Functionality

### AI Features Status
- [ ] Semantic Search Implementation
- [ ] Voice-Enabled Chatbot Status

## Technical Implementation Notes
- Backend: 
- Frontend:
- Database:
- AI Integration:

## Platform Limitations (Ohmni Robot)

User Agent: Mozilla/5.0 (Linux; Android 7.1.2; UP-CHT01 Build/NJH47B; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/52.0.2743.100 Safari/537.36

### Browser Constraints
- React functionality fails to work properly in Ohmni's browser app
- API calls fail after initial page load
- Browser has built-in features for:
  - Robot movement control
  - Speech/Talk capabilities

### Proposed Solutions

#### Server-Side Data Injection
- Currently using macro replacement for URLs (${HOSTED_REPLACE_URL})
- Extend this approach to inject JSON data during page serve:
  - Embed data directly in HTML using similar macros
  - No client-side API calls needed
  - Data available immediately on page load
- Example macros:
  - ${PROFILE_DATA}
  - ${CHALLENGERS_LIST}
  - ${SEARCH_INDEX}

#### Alternative Approaches
1. Static Page Generation
   - Pre-generate all possible pages
   - Include all necessary data in each HTML file
   - Zero runtime API calls needed

2. iframe-based Updates
   - Main content stays static
   - Use iframes for dynamic content
   - Each iframe load is a fresh page request

3. WebSocket Connection
   - If supported by Ohmni browser
   - Maintain persistent connection
   - Push updates from server

4. Form-based Navigation
   - Use traditional form submissions
   - Each interaction loads a new page
   - All data included in initial page load

#### Pros of Server-Side Injection Approach
- Works with current infrastructure
- No client-side JavaScript dependencies
- Data available immediately
- Can cache generated pages

#### Cons of Server-Side Injection Approach
- Larger initial page size
- Updates require full page reload
- Need careful macro management
- May need to implement proper caching

### Technical Implications
- Need to avoid React-based implementations
- API interactions must be handled differently than traditional web apps
- May need to leverage Ohmni's native features for movement and speech instead of web-based solutions

## Private Notes & Concerns
- Critical: Standard web application architecture needs significant modification due to Ohmni browser limitations
- Need to investigate alternative approaches for dynamic content updates without relying on client-side API calls
- Should explore maximum use of Ohmni's built-in movement and speech capabilities

## Next Steps
- Document specific Ohmni browser capabilities and limitations through testing
- Research alternative approaches to dynamic content without React
- Investigate pre-loading strategies for data that would normally require API calls

## Access & Credentials
- API Keys:
- Database Access:
- Deployment Details:

## Team Notes
-

Last Updated: [Current Date] 