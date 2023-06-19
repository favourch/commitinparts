const vscode = require('vscode');

function activate(context) {
  let disposable = vscode.commands.registerCommand('extension.commitParts', async () => {
    // Get the active text editor
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      vscode.window.showErrorMessage('No active text editor found.');
      return;
    }

    // Get the file contents
    const document = editor.document;
    const fileContents = document.getText();

    // Define the logic to split the file contents into parts (change as per your requirements)
    const parts = fileContents.split('\n'); // Split by newline for example

    // Check if Git is initialized in the workspace
    const isGitInitialized = await isGitInitialized();

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

async function isGitInitialized() {
  const result = await executeGitCommand('git rev-parse --is-inside-work-tree');
  return result.trim() === 'true';
}

async function executeGitCommand(command) {
  const workspaceRoot = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
  if (!workspaceRoot) {
    throw new Error('No workspace found.');
  }

  const options = { cwd: workspaceRoot };
  const result = await vscode.commands.executeCommand('vscode.executeTerminalCommand', { command, options });
  if (!result) {
    throw new Error('Git command execution failed.');
  }

  return result;
}

function deactivate() {}

module.exports = {
  activate,
  deactivate
};
