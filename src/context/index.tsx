"use client";

import { ReactNode } from "react";
import { FlightProvider } from "./flight";
import { ToastNotificationProvider } from "./toastNotification";
import { UserProvider } from "./user";
import { AirportProvider } from "./airport";
import { BookingProvider } from "./booking";
import { PaymentProvider } from "./payment";
import { SettingProvider } from "./setting";
import MessageProvider from "./message";

function Providers({ children }: { children: ReactNode }) {
  return (
    <ToastNotificationProvider>
      <UserProvider>
        <AirportProvider>
          <BookingProvider>
            <PaymentProvider>
              <SettingProvider>
                <MessageProvider>
                  <FlightProvider>{children}</FlightProvider>
                </MessageProvider>
              </SettingProvider>
            </PaymentProvider>
          </BookingProvider>
        </AirportProvider>
      </UserProvider>
    </ToastNotificationProvider>
  );
}

export default Providers;
