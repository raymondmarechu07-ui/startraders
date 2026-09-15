import './global.css';
import { DerivProvider } from '@/context/DerivProvider';

export const metadata = {
  title: 'Star Traders',
  description: 'Your ultimate partner in trading success.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <DerivProvider>{children}</DerivProvider>
      </body>
    </html>
  );
}
