type Props = {
  message: string;
};

export default function Toast({ message }: Props) {
  return (
    <div className="fixed bottom-5 right-5 bg-black text-white px-4 py-2 rounded shadow-lg animate-bounce">
      {message}
    </div>
  );
}
