const vscode = require('vscode');
const { exec } = require('child_process');

function activate(context) {
  let disposable = vscode.commands.registerCommand('extension.commitInParts', async () => {
    // Get the active text editor
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      vscode.window.showErrorMessage('No active text editor found.');
      return;
    }

    // Get the file contents
    const document = editor.document;
    const fileContents = document.getText();

    // Define the logic to split the file contents into parts (commit code blocks or sections based on comments)
    const parts = splitFileIntoParts(fileContents);

    // Check if Git is initialized in the workspace
    const isGitInitialized = await checkGitInitialized();

    if (!isGitInitialized) {
      vscode.window.showErrorMessage('Git is not initialized in the current workspace.');
      return;
    }

    // Commit each part separately
    for (const part of parts) {
      // Execute the Git commands for staging and committing
      await executeGitCommand('git add .');
      await executeGitCommand(`git commit -m "Committing part: ${part}"`);
    }

    vscode.window.showInformationMessage('Parts committed successfully!');
  });

  context.subscriptions.push(disposable);
}

function splitFileIntoParts(fileContents) {
  // Split the file contents into parts based on comments or code blocks
  // Modify this logic according to your requirements
  const parts = [];
  let currentPart = '';
  const lines = fileContents.split('\n');

  for (const line of lines) {
    if (isCommentLine(line) || isCodeBlockStart(line)) {
      if (currentPart.trim() !== '') {
        parts.push(currentPart.trim());
      }
      currentPart = line;
    } else {
      currentPart += '\n' + line;
    }
  }

  if (currentPart.trim() !== '') {
    parts.push(currentPart.trim());
  }

  return parts;
}

function isCommentLine(line) {
  // Check if the line is a comment line
  // Modify this logic based on the comment style used in your code
  return line.trim().startsWith('//');
}

function isCodeBlockStart(line) {
  // Check if the line indicates the start of a new code block or section
  // Modify this logic based on your requirements
  return line.trim().startsWith('/*') || line.trim().startsWith('function');
}

async function checkGitInitialized() {
  return new Promise((resolve, reject) => {
    exec(getGitCommand('rev-parse --is-inside-work-tree'), (error, stdout) => {
      if (error) {
        reject(error);
      } else {
        resolve(stdout.trim() === 'true');
      }
    });
  });
}

async function executeGitCommand(command) {
  const workspaceRoot = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
  if (!workspaceRoot) {
    throw new Error('No workspace found.');
  }

  return new Promise((resolve, reject) => {
    exec(getGitCommand(command), { cwd: workspaceRoot }, (error, stdout) => {
      if (error) {
        reject(error);
      } else {
        resolve(stdout.trim());
      }
    });
  });
}

function getGitCommand(command) {
  const vscodeConfig = vscode.workspace.getConfiguration('git');
  const gitExecutablePath = vscodeConfig.get('path') || 'git';

  return `${gitExecutablePath} ${command}`;
}

function deactivate() {}

module.exports = {
  activate,
  deactivate
};
