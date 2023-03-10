import React, { useState } from "react";
import axios from "axios";
import { useRouter } from "next/router";
import styled from "@emotion/styled";
import { colourOptions, colourStyles } from "./Select";
import Select from "react-select";
import { getDownloadURL, ref, uploadString } from "firebase/storage";
import { authService, storageService } from "../firebase/firebase";
import { useRecoilValue } from "recoil";
import { hospitalData } from "../share/atom";
import { useMutation } from "react-query";

const Container = styled.div``;
const FormWrap = styled.form`
  align-items: center;
  padding: 50px;
`;

const ImageBox = styled.label`
  display: flex;
  justify-content: center;
  border-radius: 100%;
  overflow: hidden;
  cursor: pointer;
  width: 150px;
  height: 150px;
  margin: auto;
  > img {
    width: 100%;
    height: 100%;
    text-align: center;
    object-fit: cover;
  }
`;

const PostImage = styled.img`
  border: 0.1px solid lightgray;
  border-radius: 100%;
  object-fit: cover;
`;

const InputWrap = styled.div`
  display: flex;
  flex-direction: column;
  margin-top: 10px;
  margin-bottom: 10px;
`;

const TitleBox = styled.textarea`
  margin: 10px 0;
  padding: 8px;
  font-size: 16px;
  border-radius: 5px;
  border: 1px solid gray;
  resize: none;
`;

const ContentBox = styled.textarea`
  margin: 10px 0;
  padding: 8px;
  font-size: 16px;
  border-radius: 5px;
  border: 1px solid gray;
  resize: none;
`;

const TotalCostBox = styled.textarea`
  margin: 10px 0;
  padding: 8px;
  font-size: 16px;
  border-radius: 5px;
  border: 1px solid gray;
  resize: none;
`;

const CreatePostButton = styled.button`
  margin: 10px 0;
  padding: 8px;
  font-size: 16px;
  border-radius: 5px;
  border: none;
  background-color: lightgray;
  cursor: pointer;
  float: right;
`;
const StarRating = styled.div`
  display: flex;
  flex-direction: row;
  cursor: pointer;
  margin-bottom: 20px;
`;

const PostSelect = styled.div`
  margin-bottom: 30px;
`;

const NewPost = ({ setPostEdit, refetchPost, id }) => {
  const [editTitle, setEditTitle] = useState("");
  const [editContents, setEditContents] = useState("");
  const [editTotalCost, setEditTotalCost] = useState("");
  const [editRatings, setEditRatings] = useState("");
  const [editSelectValue, setEditSelectValue] = useState([]);

  const router = useRouter();

  const placesData = useRecoilValue(hospitalData);
  console.log("placedata", placesData);
  console.log("dddd", id);

  // ?????? ?????????
  const starArray = Array.from({ length: 5 }, (_, i) => i + 1);

  const Star = ({ selected, onClick }) => (
    <div
      style={{
        color: selected ? "#ffc107" : "#e4e5e9",
      }}
      onClick={onClick}
    >
      <span style={{ fontSize: "40px" }}>&#9733;</span>
    </div>
  );

  // ????????? ????????????
  const { mutate: updateMutate } = useMutation(
    (data) =>
      axios
        .put(`https://humble-summer-ballcap.glitch.me/posts/${id}`, data)
        .then((res) => res.data),
    {
      onSuccess: () => {
        refetchPost();
      },
    },
  );

  const createdAt = Date.now();
  const timestamp = new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(createdAt);

  const handleEditSubmit = async (downloadUrl) => {
    updateMutate({
      id,
      downloadUrl,
      title: editTitle,
      contents: editContents,
      selectedColors: editSelectValue.map((option) => option.value),
      rating: editRatings,
      totalCost: editTotalCost,
      profileImage: authService.currentUser?.photoURL,
      date: timestamp,
      displayName: authService.currentUser?.displayName,
      userId: authService.currentUser?.uid,
      hospitalId: placesData.id,
    });
    refetchPost();
    localStorage.removeItem("Photo");
    setPostEdit(false);
  };

  // ????????? ?????????(???????????? ????????? ?????? ??????)
  const uploadPhoto = async (event) => {
    try {
      const theFile = event.target.files[0];
      const reader = new FileReader();
      reader.readAsDataURL(theFile); // file ????????? ??????????????? ?????? ??? ?????? data URL??? ??????.

      reader.onloadend = (finishedEvent) => {
        // ??????????????? ??????????????? data URL??? ?????? ????????? ????????? ???
        const contentimgDataUrl = finishedEvent.currentTarget.result;
        localStorage.setItem("Photo", contentimgDataUrl);
        document.getElementById("preview-photo").src = contentimgDataUrl; //useref ???????????? DOM??? ?????? ?????? ?????? ??????
      };
    } catch (error) {
      console.error(error);
    }
  };

  const ChangePhoto = async (event) => {
    event.preventDefault();
    // ????????? ???????????? ????????? ????????? url??? ?????? ??????????????? ?????? ????????? ?????????
    // ??? ??? ???????????? firestore??? ?????????
    try {
      let newPhoto = localStorage.getItem("Photo");
      const imgRef = ref(storageService, `${Date.now()}`);

      let downloadUrl;
      if (newPhoto) {
        const response = await uploadString(imgRef, newPhoto, "data_url");
        downloadUrl = await getDownloadURL(response.ref);
      }
      if (downloadUrl) {
        console.log("downloadUrl", downloadUrl);
        // setEditDownLoadUrl(downloadUrl);
        handleEditSubmit(downloadUrl);
      } else if (downloadUrl === undefined) {
        // ????????? ????????? ????????? ??????
        alert("????????? ????????? ????????????");
        return;
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <>
      <Container>
        <FormWrap
          onSubmit={(e) => {
            ChangePhoto(
              e,
              id,
              downloadUrl,
              selectedColors,
              rating,
              totalCost,
              isEdit,
              profileImage,
              date,
              displayName,
              userId,
            );
          }}
        >
          <ImageBox htmlFor="file">
            <PostImage
              id="preview-photo"
              src="https://media.istockphoto.com/id/1248723171/vector/camera-photo-upload-icon-on-isolated-white-background-eps-10-vector.jpg?s=612x612&w=0&k=20&c=e-OBJ2jbB-W_vfEwNCip4PW4DqhHGXYMtC3K_mzOac0="
              alt="???????????????"
            />
          </ImageBox>
          <input
            id="file"
            type="file"
            style={{ display: "none" }}
            accept="images/*"
            onChange={uploadPhoto}
          />
          <InputWrap>
            <label htmlFor="title">????????????</label>
            <TitleBox
              type="text"
              placeholder="Title"
              onChange={(event) => setEditTitle(event.target.value)}
              id="title"
              rows="1"
              maxLength="50"
            />
            <label htmlFor="title">??? ??????</label>
            <ContentBox
              type="text"
              placeholder="Contents"
              onChange={(event) => setEditContents(event.target.value)}
              rows="8"
              maxLength="500"
            />
            <label htmlFor="title">??? ?????????</label>
            <TotalCostBox
              type="text"
              placeholder="TotalCost"
              onChange={(event) => setEditTotalCost(event.target.value)}
              rows="3"
              maxLength="200"
            />
          </InputWrap>
          <label htmlFor="title">???????????????</label>
          <StarRating>
            {starArray.map((star) => (
              <Star
                key={star}
                selected={star <= editRatings}
                onClick={() => setEditRatings(star)}
              />
            ))}
          </StarRating>
          <label htmlFor="title">??? ????????? ???????????? ???????????????</label>
          <PostSelect>
            <Select
              value={editSelectValue}
              onChange={(selectedOptions) =>
                setEditSelectValue(selectedOptions)
              }
              closeMenuOnSelect={false}
              defaultValue={[colourOptions[0], colourOptions[1]]}
              isMulti
              options={colourOptions}
              styles={colourStyles}
              instanceId="selectbox"
            />
          </PostSelect>
          <CreatePostButton>????????????</CreatePostButton>
        </FormWrap>
      </Container>
    </>
  );
};

export default NewPost;
