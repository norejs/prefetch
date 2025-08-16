export async function get(url: string): Promise<any> {
  try {
    const response = await fetch(url);

    if (response?.status !== 200) {
      return null;
    }
    const res = await response?.text?.();
    try {
      return JSON.parse(res);
    } catch (error) {}
    return res;
  } catch (error) {
    console.error("get error", error);
    return null;
  }
}
