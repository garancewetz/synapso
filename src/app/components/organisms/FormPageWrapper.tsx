interface FormPageWrapperProps {
  children: React.ReactNode;
}

export default function FormPageWrapper({ children }: FormPageWrapperProps) {
  return (
    <div className="p-3 sm:p-6 bg-gray-50">
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-4 sm:p-6">
          {children}
        </div>
      </div>
    </div>
  );
}

