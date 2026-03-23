export default function CodeEditor() {
  return (
    <div className="h-screen w-full">
      <iframe
        src="http://localhost:8888/lab/tree/ipynb/test.ipynb"
        className="w-full h-full border-none"
        title="notebook"
      />
    </div>
  );
}
