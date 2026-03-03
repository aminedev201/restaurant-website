export default function AdminFooter() {
  return (
    <footer className="h-10 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 flex items-center justify-center">
      <p className="text-xs text-gray-400">
        © {new Date().getFullYear()} La Maison Admin Panel
      </p>
    </footer>
  );
}