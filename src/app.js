class LinkedInTerminal {
    constructor() {
        this.profiles = [];
        this.currentProfileIndex = -1;
        this.initializeTerminal();
    }

    initializeTerminal() {
        this.terminal = document.getElementById('terminal');
        this.output = document.getElementById('output');
        this.input = document.getElementById('terminal-input');
        this.profileViewer = document.getElementById('profile-viewer');
        this.profileFrame = document.getElementById('profile-frame');
        
        this.setupEventListeners();
        this.welcomeMessage();
    }

    setupEventListeners() {
        // Handle terminal input
        this.input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.handleCommand(this.input.value);
                this.input.value = '';
            }
        });

        // Handle profile viewer close button
        document.getElementById('close-profile').addEventListener('click', () => {
            this.hideProfileViewer();
        });
    }

    welcomeMessage() {
        this.writeToTerminal('Welcome to LinkedIn Terminal v1.0.0', 'info');
        this.writeToTerminal('Type "help" for available commands', 'info');
        this.writeToTerminal('');
    }

    writeToTerminal(text, type = '') {
        const line = document.createElement('div');
        line.className = `output-line ${type}`;
        line.textContent = text;
        this.output.appendChild(line);
        this.output.scrollTop = this.output.scrollHeight;
    }

    handleCommand(command) {
        this.writeToTerminal(`$> ${command}`);
        
        const args = command.toLowerCase().split(' ');
        const cmd = args[0];

        switch(cmd) {
            case 'help':
                this.showHelp();
                break;
            case 'add':
                if (args.length < 2) {
                    this.writeToTerminal('Usage: add <linkedin-profile-url>', 'error');
                } else {
                    this.addProfile(args.slice(1).join(' '));
                }
                break;
            case 'list':
                this.listProfiles();
                break;
            case 'view':
                if (args.length < 2) {
                    this.writeToTerminal('Usage: view <profile-number>', 'error');
                } else {
                    this.viewProfile(parseInt(args[1]) - 1);
                }
                break;
            case 'next':
                this.nextProfile();
                break;
            case 'prev':
                this.previousProfile();
                break;
            case 'clear':
                this.clearTerminal();
                break;
            default:
                this.writeToTerminal(`Unknown command: ${cmd}`, 'error');
                this.writeToTerminal('Type "help" for available commands', 'info');
        }
    }

    showHelp() {
        const commands = [
            'Available commands:',
            'help              - Show this help message',
            'add <url>         - Add a LinkedIn profile URL',
            'list              - List all saved profiles',
            'view <number>     - View a specific profile',
            'next             - View next profile',
            'prev             - View previous profile',
            'clear            - Clear terminal output'
        ];
        
        commands.forEach(cmd => this.writeToTerminal(cmd, 'info'));
    }

    addProfile(url) {
        if (!url.includes('linkedin.com/')) {
            this.writeToTerminal('Invalid LinkedIn URL', 'error');
            return;
        }

        this.profiles.push(url);
        this.writeToTerminal(`Profile added successfully. Total profiles: ${this.profiles.length}`, 'success');
        this.updateProfileCount();
    }

    listProfiles() {
        if (this.profiles.length === 0) {
            this.writeToTerminal('No profiles saved', 'info');
            return;
        }

        this.writeToTerminal('Saved profiles:', 'info');
        this.profiles.forEach((url, index) => {
            this.writeToTerminal(`${index + 1}. ${url}`);
        });
    }

    viewProfile(index) {
        if (index < 0 || index >= this.profiles.length) {
            this.writeToTerminal('Invalid profile number', 'error');
            return;
        }

        this.currentProfileIndex = index;
        this.showProfileViewer(this.profiles[index]);
    }

    nextProfile() {
        if (this.profiles.length === 0) {
            this.writeToTerminal('No profiles saved', 'error');
            return;
        }

        const nextIndex = this.currentProfileIndex + 1;
        if (nextIndex >= this.profiles.length) {
            this.writeToTerminal('Already at last profile', 'error');
            return;
        }

        this.viewProfile(nextIndex);
    }

    previousProfile() {
        if (this.profiles.length === 0) {
            this.writeToTerminal('No profiles saved', 'error');
            return;
        }

        const prevIndex = this.currentProfileIndex - 1;
        if (prevIndex < 0) {
            this.writeToTerminal('Already at first profile', 'error');
            return;
        }

        this.viewProfile(prevIndex);
    }

    showProfileViewer(url) {
        this.profileFrame.src = url;
        this.profileViewer.classList.add('visible');
    }

    hideProfileViewer() {
        this.profileViewer.classList.remove('visible');
    }

    clearTerminal() {
        this.output.innerHTML = '';
        this.welcomeMessage();
    }

    updateProfileCount() {
        document.getElementById('profile-count').textContent = `Profiles: ${this.profiles.length}`;
    }
}

// Initialize the terminal when the page loads
document.addEventListener('DOMContentLoaded', () => {
    window.terminal = new LinkedInTerminal();
}); 