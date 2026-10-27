const unavailable='The contact service is temporarily unavailable. Your message is still here. Please email hi@saikatchowdhury.com directly or try again later.';

export async function readContactResponse(response){
  if(!response.headers.get('content-type')?.toLowerCase().includes('application/json'))throw new Error(unavailable);
  let data;
  try{data=await response.json()}catch{throw new Error(unavailable)}
  if(!data||typeof data!=='object'||Array.isArray(data))throw new Error(unavailable);
  return data;
}

export async function submitInquiry(values,{fetcher=fetch}={}){
  let response;
  try{
    response=await fetcher('/api/contact',{method:'POST',headers:{'Content-Type':'application/json',Accept:'application/json'},body:JSON.stringify(values),signal:AbortSignal.timeout(35000)});
  }catch(error){
    if(error.name==='TimeoutError')throw new Error('Delivery is taking longer than expected. Please wait before trying again, or email me directly.');
    throw new Error('Could not reach the contact service. Your message is still here. Check your connection or email hi@saikatchowdhury.com directly.');
  }
  const data=await readContactResponse(response);
  if(!response.ok||data.ok!==true)throw new Error(typeof data.error==='string'?data.error:unavailable);
  return data;
}
