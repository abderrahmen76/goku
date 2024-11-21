const vscode = require('vscode');

// Create a decoration type for cursor effect (light background near the cursor)
let cursorDecorationType = vscode.window.createTextEditorDecorationType({
    rangeBehavior: vscode.DecorationRangeBehavior.ClosedOpen,
});

// Helper function to generate a color based on diagnostics (error, warning, or clean)
function getCursorColorForDiagnostics(diagnostics, lineNumber) {
    let cursorColor = 'rgba(0, 255, 0, 0.1)'; // Default: Green for correct code with high transparency

    // Check if there's any diagnostic for the current line
    for (const diagnostic of diagnostics) {
        if (diagnostic.range.start.line <= lineNumber && diagnostic.range.end.line >= lineNumber) {
            // Red for errors with high transparency
            if (diagnostic.severity === vscode.DiagnosticSeverity.Error) {
                cursorColor = 'rgba(255, 0, 0, 0.1)';
            }
            // Yellow for warnings with high transparency
            else if (diagnostic.severity === vscode.DiagnosticSeverity.Warning) {
                cursorColor = 'rgba(255, 255, 0, 0.1)';
            }
            break; // No need to check further once a relevant diagnostic is found
        }
    }
    return cursorColor;
}

// Activates the extension and sets up event listeners
function activate(context) {
    // Add a log to confirm activation
    console.log('Kami Cursor extension is activated!');

    // Listen for cursor movement or text selection changes
    vscode.window.onDidChangeTextEditorSelection((event) => {
        const editor = event.textEditor;
        triggerCursorAnimation(editor);
    });

    // Listen for diagnostics (errors/warnings) in the editor
    vscode.languages.onDidChangeDiagnostics((e) => {
        const editor = vscode.window.activeTextEditor;
        if (editor) {
            triggerCursorAnimation(editor);
        }
    });

    console.log('Kami Cursor extension setup complete!');
}

// Function to apply the animation (decoration) around the cursor
function triggerCursorAnimation(editor) {
    if (!editor) return;

    // Retrieve the diagnostics (errors/warnings) for the current file
    const diagnostics = vscode.languages.getDiagnostics(editor.document.uri);
    const cursorPosition = editor.selection.active;
    const line = cursorPosition.line;
    const char = cursorPosition.character;

    // Define how many characters before and after the cursor to highlight
    const rangeBefore = 5; // Number of characters before the cursor
    const rangeAfter = 5;  // Number of characters after the cursor

    // Determine the range for decoration
    const startChar = Math.max(char - rangeBefore, 0); // Prevent going before the start of the line
    const endChar = Math.min(char + rangeAfter, editor.document.lineAt(line).text.length); // Prevent going beyond the end of the line

    // Determine the color based on diagnostics (errors, warnings, or correct code)
    const cursorColor = getCursorColorForDiagnostics(diagnostics, line);

    // Create the range for the portion around the cursor
    const range = new vscode.Range(
        new vscode.Position(line, startChar), // Start of the range
        new vscode.Position(line, endChar)    // End of the range
    );

    // Create the decoration type for the selected range (portion of the line)
    const decorationType = vscode.window.createTextEditorDecorationType({
        backgroundColor: cursorColor,
        rangeBehavior: vscode.DecorationRangeBehavior.ClosedClosed,
    });

    // Apply the decoration to the editor
    editor.setDecorations(decorationType, [range]);

    // Optionally clear the decorations after a set duration (e.g., 500ms)
    setTimeout(() => {
        editor.setDecorations(decorationType, []); // Remove the decoration
    }, 500);
}

function deactivate() {}

module.exports = {
    activate,
    deactivate
};
