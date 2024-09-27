# from sentence_transformers import SentenceTransformer, util


# def match_namespace(keyword_array, query):
#     model = SentenceTransformer('all-MiniLM-L6-v2')

#     query_embedding = model.encode(query, convert_to_tensor=True)
#     best_match = None
#     best_text = ""
#     highest_score = -1

#     for keyword, namespace in keyword_array:
#         embedding = model.encode(keyword)
#         score = util.pytorch_cos_sim(embedding, query_embedding).item()

#         if score > highest_score:
#             highest_score = score
#             best_match = namespace
#             best_text = keyword
#     print(best_text)
#     return best_match
