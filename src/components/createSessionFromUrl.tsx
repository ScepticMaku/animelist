import { supabase } from "../utils/supabase";
import * as QueryParams from "expo-auth-session/build/QueryParams";
import { showToast } from "./showToast";

export const createSessionFromUrl = async (url: string) => {
  const { params } = QueryParams.getQueryParams(url);
  const { code } = params;
  const { access_token, refresh_token } = params;

  if (code) {
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      showToast("Session Error: " + error.message);
      return;
    };

    return data.session;
  }

  if (access_token || refresh_token) {
    const { data, error } = await supabase.auth.setSession({
      access_token: access_token,
      refresh_token: refresh_token,
    });

    if (error) {
      showToast("Session error: " + error.message);
      return;
    }

    return data.session;
  }

};
